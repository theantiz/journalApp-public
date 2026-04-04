package com.antiz.journalApp.service;

import com.antiz.journalApp.entity.JournalEntry;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.repository.JournalEntryRepository;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
public class JournalEntryService {
    // business logic here
    //create e entry in MongoDB

    @Autowired
    private JournalEntryRepository journalEntryRepository;
    @Autowired
    private UserService userService;
    @Autowired
    private SentimentAnalysisService sentimentAnalysisService;

    @Transactional // meaning all the loc inside this method treats this as single operation  will make container & if any error data will get rollback
    public JournalEntry saveEntry(JournalEntry journalEntry, String userName) { //created a transactional method
      try {
          User user = userService.findByUserName(userName);
          if (user == null) {
              throw new IllegalArgumentException("user not found");
          }

          applySentiment(journalEntry, user);
          JournalEntry saved = journalEntryRepository.save(journalEntry);
          if (!userHasEntry(user, saved.getId())) {
              user.getJournalEntries().add(saved);
          }
          userService.saveUser(user);
          return saved;
      }
      catch (Exception e) {
          System.out.println(e);
          throw new RuntimeException("error while saving journal entry");
      }
    } // here we have achieved the atomicity meaning if one failed then all failed.
    // if two user call this api then a box will be created for both user corresponding. Both operation are isolated
    // now to handle this type of transaction we make manager to make, find this method, maange the method
    //manager is platformTransactionManger (Interface)  -> MongoTransactionManager (this instance will get return &&  behind the scene session && helps to establish the connection with database)
    // if everything good manager will "commit" else "rollback"


    public void saveEntry(JournalEntry journalEntry) {
        journalEntryRepository.save(journalEntry);
    }

    public List<JournalEntry> getAll() {
        return journalEntryRepository.findAll();
    }

    public Optional<JournalEntry> findByID(ObjectId myId) {
        return journalEntryRepository.findById(myId);
    }


    // we will use slf4j for logger
    // logging abstraction framework

    @Transactional
    public boolean deleteByID(ObjectId myId, String userName) {
        boolean removed = false;
        try {


        User user = userService.findByUserName(userName);
            removed = user.getJournalEntries().removeIf(x -> x.getId().equals(myId));

            if (removed) {
                userService.saveUser(user);
        journalEntryRepository.deleteById(myId);

            }
        } catch (Exception e) {
            System.out.println(e);
        }
        return removed;
    }

    private void applySentiment(JournalEntry journalEntry, User user) {
        if (journalEntry.getSentiment() != null) {
            return;
        }

        if (user.isSentimentAnalysis()) {
            journalEntry.setSentiment(sentimentAnalysisService.analyze(journalEntry.getTitle(), journalEntry.getContent()));
            return;
        }
        journalEntry.setSentiment(null);
    }

    private boolean userHasEntry(User user, ObjectId entryId) {
        if (entryId == null) {
            return false;
        }

        return user.getJournalEntries().stream()
                .map(JournalEntry::getId)
                .anyMatch(entryId::equals);
    }
}
