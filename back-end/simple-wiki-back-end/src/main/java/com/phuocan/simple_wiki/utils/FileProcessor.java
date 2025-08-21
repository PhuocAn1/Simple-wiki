package com.phuocan.simple_wiki.utils;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;

public class FileProcessor {
    public static String processFileToSingleLine() {
        // Hardcoded file path
        String filePath = "src/main/resources/table.txt";
        StringBuilder result = new StringBuilder();

        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            String line;
            while ((line = reader.readLine()) != null) {
                // Escape double quotes and append newline
                String processedLine = line.replace("\"", "\\\"") + "\\n";
                result.append(processedLine);
            }
        } catch (IOException e) {
            throw new RuntimeException("Error reading file: " + filePath, e);
        }

        // Remove the last \n if present to avoid trailing newline
        if (result.length() > 2 && result.substring(result.length() - 2).equals("\\n")) {
            result.setLength(result.length() - 2);
        }

        return result.toString();
    }

    public static void main(String[] args) {
        // Example usage
        String output = processFileToSingleLine();
        System.out.println(output);
    }
}
