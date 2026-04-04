package com.antiz.journalApp.service;

import com.antiz.journalApp.entity.JournalEntry;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.enums.Sentiment;
import com.antiz.journalApp.repository.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JournalEntryServiceTest {

    @Mock
    private JournalEntryRepository journalEntryRepository;

    @Mock
    private UserService userService;

    @Mock
    private SentimentAnalysisService sentimentAnalysisService;

    @InjectMocks
    private JournalEntryService journalEntryService;

    @Test
    void saveEntryAssignsSentimentWhenEnabled() {
        User user = new User();
        user.setUserName("alex");
        user.setSentimentAnalysis(true);

        JournalEntry entry = new JournalEntry();
        entry.setTitle("Solid day");
        entry.setContent("I feel calm and grateful.");
        ObjectId entryId = new ObjectId();

        when(userService.findByUserName("alex")).thenReturn(user);
        when(sentimentAnalysisService.analyze("Solid day", "I feel calm and grateful.")).thenReturn(Sentiment.HAPPY);
        when(journalEntryRepository.save(entry)).thenAnswer(invocation -> {
            entry.setId(entryId);
            return entry;
        });

        journalEntryService.saveEntry(entry, "alex");

        assertEquals(Sentiment.HAPPY, entry.getSentiment());
        assertEquals(1, user.getJournalEntries().size());
        assertEquals(entryId, user.getJournalEntries().get(0).getId());
        verify(userService).saveUser(user);
    }

    @Test
    void saveEntrySkipsAnalysisWhenDisabled() {
        User user = new User();
        user.setUserName("alex");
        user.setSentimentAnalysis(false);

        JournalEntry entry = new JournalEntry();
        entry.setTitle("Busy day");
        entry.setContent("Mostly meetings.");
        entry.setSentiment(Sentiment.SAD);

        when(userService.findByUserName("alex")).thenReturn(user);
        when(journalEntryRepository.save(entry)).thenReturn(entry);

        journalEntryService.saveEntry(entry, "alex");

        assertNull(entry.getSentiment());
        verifyNoInteractions(sentimentAnalysisService);
        verify(userService).saveUser(user);
    }

    @Test
    void saveEntryDoesNotDuplicateExistingReference() {
        User user = new User();
        user.setUserName("alex");
        user.setSentimentAnalysis(true);

        JournalEntry existingEntry = new JournalEntry();
        ObjectId entryId = new ObjectId();
        existingEntry.setId(entryId);
        user.getJournalEntries().add(existingEntry);

        JournalEntry entry = new JournalEntry();
        entry.setId(entryId);
        entry.setTitle("Stress log");
        entry.setContent("I was worried and overwhelmed.");

        when(userService.findByUserName("alex")).thenReturn(user);
        when(sentimentAnalysisService.analyze("Stress log", "I was worried and overwhelmed.")).thenReturn(Sentiment.ANXIOUS);
        when(journalEntryRepository.save(entry)).thenReturn(entry);

        journalEntryService.saveEntry(entry, "alex");

        assertEquals(1, user.getJournalEntries().size());
        verify(userService).saveUser(user);
        verify(journalEntryRepository, times(1)).save(entry);
    }
}
