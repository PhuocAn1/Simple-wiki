package com.phuocan.simple_wiki.model;

import com.phuocan.simple_wiki.repository.MultimediaRepository;
import com.phuocan.simple_wiki.repository.PageRepository;
import info.bliki.Messages;
import info.bliki.htmlcleaner.ContentToken;
import info.bliki.htmlcleaner.TagNode;
import info.bliki.wiki.filter.Encoder;
import info.bliki.wiki.filter.WikipediaParser;
import info.bliki.wiki.filter.WikipediaPreTagParser;
import info.bliki.wiki.model.ImageFormat;
import info.bliki.wiki.model.WikiModel;
import info.bliki.wiki.tags.HTMLTag;
import info.bliki.wiki.tags.WPATag;
import info.bliki.wiki.tags.util.TagStack;
import org.luaj.vm2.ast.Str;
import org.owasp.encoder.Encode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class CustomWikiModel extends WikiModel {
    private PageRepository pageRepository;
    private final MultimediaRepository multimediaRepository;
    private static final Logger logger = LoggerFactory.getLogger(CustomWikiModel.class);

    public CustomWikiModel(PageRepository pageRepository, MultimediaRepository multimediaRepository) {
        super("/media/${image}", "/pages/${title}"); // Base URLs for images and pages
        this.pageRepository = pageRepository;
        this.multimediaRepository = multimediaRepository;
    }

    public String getLinkReplacement(String title, String label) {
        logger.info("Checking title: " + title);
        boolean exists = pageRepository.findByTitle(title).isPresent();
        //String href = exists ? "/pages/" + title : "/create/" + title;
        String href = exists ? "/pages/" + title.replace(" ", "_") : "/create/" + title.replace(" ", "_");
        logger.info("Exist? " + exists);
        String cssClass = exists ? "wiki-link" : "red-link";
        return "<a href=\"" + href + "\" class=\"" + cssClass + "\">" + (label != null ? label : title) + "</a>";
    }

    @Override
    public void appendInternalLink(String topic, String hashSection, String topicDescription, String cssClass, boolean parseRecursive) {
        boolean exist = pageRepository.findByTitle(topic.trim()).isPresent();
        if (!exist) {
            //logger.warn("Topic: {} doesn't exist", topic);
            cssClass = "red-link";
        } else {
            //logger.info("Topic: {} does exist", topic);
            cssClass = "wiki-link";
        }
        this.appendInternalLink(topic, hashSection, topicDescription, cssClass, parseRecursive, exist);
    }

    @Override
    public void appendInternalLink(String topic, String hashSection, String topicDescription, String cssClass, boolean parseRecursive, boolean topicExists) {
        //logger.info("Beginning appending internal link!");
        //logger.info("Topic:{} Description:{} HasSection:{}", topic, topicDescription, hashSection);

        String description = topicDescription.trim();
        WPATag aTagNode = new WPATag();
        String hrefLink;
        String title;
        if (topic.length() > 0) {
            title = Encoder.normaliseTitle(topic, true, ' ', this.casing() == Casing.FirstLetter);
            String encodedTopic;
            if (hashSection == null) {
                encodedTopic = Encoder.normaliseTitle(this.fPageTitle, true, ' ', true);
                if (title.equals(encodedTopic)) {
                    HTMLTag selfLink = new HTMLTag("strong");
                    selfLink.addAttribute("class", "selflink", false);
                    this.pushNode(selfLink);
                    selfLink.addChild(new ContentToken(description));
                    this.popNode();
                    return;
                }
            }

            encodedTopic = this.encodeTitleToUrl(topic, this.casing() == Casing.FirstLetter);
            if (this.replaceColon()) {
                encodedTopic = encodedTopic.replace(':', '/');
            }

            hrefLink = this.getWikiBaseURL().replace("${title}", encodedTopic);
            if (!topicExists) {
                if (cssClass == null) {
                    cssClass = "new";
                }

                if (hrefLink.indexOf(63) != -1) {
                    hrefLink = hrefLink + "&";
                } else {
                    hrefLink = hrefLink + "?";
                }

                hrefLink = hrefLink + "action=edit&redlink=1";
                String redlinkString = Messages.getString(this.getResourceBundle(), "wiki.tags.red-link", "${title} (page does not exist)");
                title = redlinkString.replace("${title}", title);

            }
            aTagNode.addAttribute("title", title, true);
        } else if (hashSection != null) {
            hrefLink = "";
            if (description.length() == 0) {
                description = "&#35;" + hashSection;
            }
        } else {
            hrefLink = this.getWikiBaseURL().replace("${title}", "");
        }

        title = hrefLink;
        if (topicExists && hashSection != null) {
            aTagNode.addObjectAttribute("anchor", hashSection);
            title = hrefLink + '#' + this.encodeTitleDotUrl(hashSection, false);
        }

        aTagNode.addAttribute("href", title, true);
        if (cssClass != null) {
            aTagNode.addAttribute("class", cssClass, true);
        }

        aTagNode.addObjectAttribute("wikilink", topic);
        this.pushNode(aTagNode);
        if (parseRecursive) {
            WikipediaPreTagParser.parseRecursive(description, this, false, true);
        } else {
            aTagNode.addChild(new ContentToken(description));
        }
        this.popNode();
    }

    public String extractFileNameFromSrc(String src) {
        if (src == null || !src.contains("/")) return src;

        String[] parts = src.split("/");
        String lastSegment = parts[parts.length - 1];

        return lastSegment; // fallback
    }

    @Override
    public void appendInternalImageLink(String hrefImageLink, String srcImageLink, ImageFormat imageFormat) {
        logger.info("appendInternalImageLink called with href: {}, src: {}, imageFormat: {}", hrefImageLink, srcImageLink, imageFormat);
        String fileName = extractFileNameFromSrc(srcImageLink.trim());
        srcImageLink = "http://localhost:8080/simple-wiki/media/" + fileName;

        //hrefImageLink = "/simple-wiki/pages/File:" + fileName;
        hrefImageLink = "http://localhost:8080/simple-wiki/media/" + fileName;
        //super.appendInternalImageLink(hrefImageLink, srcImageLink, imageFormat);

        String caption = imageFormat.getCaption();
        String imageType = imageFormat.getType();

        TagNode divInnerTagNode = new TagNode("div");
        divInnerTagNode.addAttribute("id", "image", false);
        if (hrefImageLink.length() != 0) {
            divInnerTagNode.addAttribute("href", hrefImageLink, false);
        }

        divInnerTagNode.addAttribute("src", srcImageLink, false);
        this.setDefaultThumbWidth(imageFormat);
        divInnerTagNode.addObjectAttribute("wikiobject", imageFormat);
        this.pushNode(divInnerTagNode);

        try {
            if (caption != null && caption.length() > 0 && ("frame".equals(imageType) || "thumb".equals(imageType) || "thumbnail".equals(imageType))) {
                TagNode captionTagNode = new TagNode("div");
                String clazzValue = "caption";
                String type = imageFormat.getType();
                if (type != null) {
                    clazzValue = type + clazzValue;
                }

                captionTagNode.addAttribute("class", clazzValue, false);
                TagStack localStack = WikipediaParser.parseRecursive(caption, this, true, true);
                captionTagNode.addChildren(localStack.getNodeList());
                String altAttribute = imageFormat.getAlt();
                if (altAttribute == null) {
                    altAttribute = captionTagNode.getBodyString();
                    imageFormat.setAlt(Encoder.encodeHtml(altAttribute));
                }

                this.pushNode(captionTagNode);
                this.popNode();
            }
        } finally {
            this.popNode();
        }

    }

}
