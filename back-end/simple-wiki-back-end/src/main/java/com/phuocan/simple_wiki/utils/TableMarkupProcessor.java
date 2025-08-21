package com.phuocan.simple_wiki.utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class TableMarkupProcessor {
    // Hardcoded file path
    private static final String INPUT_FILE = "src/main/resources/table.txt";

    public static void main(String[] args) {
        try {
            String result = processTableMarkup(INPUT_FILE);
            System.out.println(result);
        } catch (IOException e) {
            System.err.println("Error processing file: " + e.getMessage());
        }
    }

    public static String processTableMarkup(String inputFile) throws IOException {
        StringBuilder markup = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new FileReader(inputFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                markup.append(line.trim());
            }
        }

        // Split by table delimiters and add \n
        String input = markup.toString();
        StringBuilder result = new StringBuilder();
        int i = 0;
        while (i < input.length()) {
            if (input.startsWith("{|", i)) {
                // Table start
                result.append("{|");
                i += 2;
                // Consume attributes (e.g., class="wikitable")
                while (i < input.length() && input.charAt(i) != '\n' && !input.startsWith("|+", i) && !input.startsWith("|-", i)) {
                    result.append(input.charAt(i));
                    i++;
                }
                result.append("\\n");
            } else if (input.startsWith("|}", i)) {
                // Table end
                result.append("|}\\n");
                i += 2;
            } else if (input.startsWith("|+", i)) {
                // Caption
                result.append("|+");
                i += 2;
                while (i < input.length() && input.charAt(i) != '\n' && !input.startsWith("|-", i)) {
                    result.append(input.charAt(i));
                    i++;
                }
                result.append("\\n");
            } else if (input.startsWith("|-", i)) {
                // Row
                result.append("|-\\n");
                i += 2;
            } else if (input.startsWith("!!", i) || input.charAt(i) == '!') {
                // Header cell
                result.append(input.charAt(i));
                i++;
                if (input.startsWith("!", i)) {
                    result.append("!");
                    i++;
                }
                while (i < input.length() && input.charAt(i) != '\n' && !input.startsWith("|-", i) && !input.startsWith("!!", i) && input.charAt(i) != '!') {
                    result.append(input.charAt(i));
                    i++;
                }
                if (i < input.length() && (input.charAt(i) == '\n' || input.startsWith("|-", i))) {
                    result.append("\\n");
                }
            } else if (input.startsWith("||", i) || input.charAt(i) == '|') {
                // Data cell
                result.append(input.charAt(i));
                i++;
                if (input.startsWith("|", i)) {
                    result.append("|");
                    i++;
                }
                while (i < input.length() && input.charAt(i) != '\n' && !input.startsWith("|-", i) && !input.startsWith("||", i) && input.charAt(i) != '|') {
                    result.append(input.charAt(i));
                    i++;
                }
                if (i < input.length() && (input.charAt(i) == '\n' || input.startsWith("|-", i))) {
                    result.append("\\n");
                }
            } else {
                // Other content (e.g., text within cells)
                result.append(input.charAt(i));
                i++;
            }
        }

        // Remove any trailing \n if not followed by content
        if (result.length() >= 2 && result.substring(result.length() - 2).equals("\\n")) {
            result.setLength(result.length() - 2);
        }

        return result.toString();
    }

}
