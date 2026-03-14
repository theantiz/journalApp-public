package com.antiz.journalApp.service;

import com.antiz.journalApp.enums.Sentiment;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class SentimentAnalysisServiceTest {

    private final SentimentAnalysisService sentimentAnalysisService = new SentimentAnalysisService();

    @Test
    void returnsHappyForPositiveEntry() {
        Sentiment sentiment = sentimentAnalysisService.analyze(
                "A good day",
                "I felt calm, grateful, and proud of the progress I made."
        );

        assertEquals(Sentiment.HAPPY, sentiment);
    }

    @Test
    void returnsSadForLowMoodEntry() {
        Sentiment sentiment = sentimentAnalysisService.analyze(
                "Rough evening",
                "I felt lonely, empty, and down after the conversation."
        );

        assertEquals(Sentiment.SAD, sentiment);
    }

    @Test
    void returnsAngryForFrustrationHeavyEntry() {
        Sentiment sentiment = sentimentAnalysisService.analyze(
                "Work spiral",
                "I am fed up and irritated. The meeting made me angry."
        );

        assertEquals(Sentiment.ANGRY, sentiment);
    }

    @Test
    void returnsAnxiousForStressHeavyEntry() {
        Sentiment sentiment = sentimentAnalysisService.analyze(
                "Before the interview",
                "My heart racing left me anxious, stressed, and unable to relax."
        );

        assertEquals(Sentiment.ANXIOUS, sentiment);
    }

    @Test
    void returnsNullWhenTextHasNoSignal() {
        Sentiment sentiment = sentimentAnalysisService.analyze(
                "Daily log",
                "I woke up, drank water, and folded laundry."
        );

        assertNull(sentiment);
    }
}
