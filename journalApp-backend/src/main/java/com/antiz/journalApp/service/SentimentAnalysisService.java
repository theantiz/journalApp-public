package com.antiz.journalApp.service;

import com.antiz.journalApp.enums.Sentiment;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Comparator;
import java.util.EnumMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
public class SentimentAnalysisService {

    private static final Map<Sentiment, List<String>> KEYWORDS = createKeywords();
    private static final Map<Sentiment, List<String>> PHRASES = createPhrases();
    private static final Map<Sentiment, Integer> TIE_BREAKER = createTieBreaker();

    public Sentiment analyze(String title, String content) {
        String text = Stream.of(title, content)
                .filter(StringUtils::hasText)
                .map(String::trim)
                .collect(Collectors.joining(" "))
                .toLowerCase(Locale.ROOT);

        if (!StringUtils.hasText(text)) {
            return null;
        }

        EnumMap<Sentiment, Integer> scores = new EnumMap<>(Sentiment.class);
        for (Sentiment sentiment : Sentiment.values()) {
            scores.put(sentiment, 0);
        }

        scorePhrases(text, scores);
        scoreKeywords(text, scores);

        return scores.entrySet().stream()
                .filter(entry -> entry.getValue() > 0)
                .max(Comparator.<Map.Entry<Sentiment, Integer>>comparingInt(Map.Entry::getValue)
                        .thenComparingInt(entry -> TIE_BREAKER.get(entry.getKey())))
                .map(Map.Entry::getKey)
                .orElse(null);
    }

    private void scorePhrases(String text, EnumMap<Sentiment, Integer> scores) {
        for (Map.Entry<Sentiment, List<String>> entry : PHRASES.entrySet()) {
            for (String phrase : entry.getValue()) {
                if (text.contains(phrase)) {
                    scores.merge(entry.getKey(), 2, Integer::sum);
                }
            }
        }
    }

    private void scoreKeywords(String text, EnumMap<Sentiment, Integer> scores) {
        String[] tokens = text.split("[^a-z]+");
        for (String token : tokens) {
            if (token.isEmpty()) {
                continue;
            }

            for (Map.Entry<Sentiment, List<String>> entry : KEYWORDS.entrySet()) {
                if (entry.getValue().contains(token)) {
                    scores.merge(entry.getKey(), 1, Integer::sum);
                }
            }
        }
    }

    private static Map<Sentiment, List<String>> createKeywords() {
        EnumMap<Sentiment, List<String>> keywords = new EnumMap<>(Sentiment.class);
        keywords.put(Sentiment.HAPPY, List.of(
                "happy", "joy", "joyful", "grateful", "great", "good", "amazing",
                "calm", "peaceful", "excited", "relieved", "hopeful", "love",
                "loved", "winning", "proud", "content"
        ));
        keywords.put(Sentiment.SAD, List.of(
                "sad", "down", "upset", "hurt", "cry", "crying", "lonely",
                "miserable", "heartbroken", "empty", "tired", "gloomy", "hopeless",
                "grief", "miss", "sorrow", "depressed"
        ));
        keywords.put(Sentiment.ANGRY, List.of(
                "angry", "mad", "furious", "rage", "raging", "annoyed", "irritated",
                "frustrated", "resentful", "hate", "hated", "snapped", "bitter"
        ));
        keywords.put(Sentiment.ANXIOUS, List.of(
                "anxious", "anxiety", "nervous", "worried", "stress", "stressed",
                "overwhelmed", "panic", "panicked", "scared", "afraid", "uneasy",
                "restless", "tense", "uncertain"
        ));
        return keywords;
    }

    private static Map<Sentiment, List<String>> createPhrases() {
        EnumMap<Sentiment, List<String>> phrases = new EnumMap<>(Sentiment.class);
        phrases.put(Sentiment.HAPPY, List.of(
                "looking forward",
                "felt proud",
                "so grateful",
                "at peace",
                "went well"
        ));
        phrases.put(Sentiment.SAD, List.of(
                "let down",
                "feel alone",
                "felt empty",
                "not okay",
                "broke down"
        ));
        phrases.put(Sentiment.ANGRY, List.of(
                "fed up",
                "lost my temper",
                "made me angry",
                "pissed off",
                "boiling over"
        ));
        phrases.put(Sentiment.ANXIOUS, List.of(
                "on edge",
                "under pressure",
                "could not relax",
                "heart racing",
                "burned out"
        ));
        return phrases;
    }

    private static Map<Sentiment, Integer> createTieBreaker() {
        EnumMap<Sentiment, Integer> priority = new EnumMap<>(Sentiment.class);
        priority.put(Sentiment.HAPPY, 1);
        priority.put(Sentiment.SAD, 2);
        priority.put(Sentiment.ANXIOUS, 3);
        priority.put(Sentiment.ANGRY, 4);
        return priority;
    }
}
