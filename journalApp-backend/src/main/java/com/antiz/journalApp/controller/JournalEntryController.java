package com.antiz.journalApp.controller;

import com.antiz.journalApp.entity.JournalEntry;
import com.antiz.journalApp.entity.User;
import com.antiz.journalApp.service.JournalEntryService;
import com.antiz.journalApp.service.JournalOptionService;
import com.antiz.journalApp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/journal")
@Tag(name = "Journal APIs", description = "Manage user journal entries")
@SecurityRequirement(name = "bearerAuth")
public class JournalEntryController {

    @Autowired
    private JournalEntryService journalEntryService;

    @Autowired
    private UserService userService;

    @Autowired
    private JournalOptionService journalOptionService;

    @GetMapping
    @Operation(summary = "Get all journal entries", description = "Returns all journal entries for authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Journal entries retrieved successfully"),
            @ApiResponse(responseCode = "404", description = "No journal entries found")
    })
    public ResponseEntity<List<JournalEntry>> getAllJournalEntriesOfUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByname(userName);
        List<JournalEntry> all = user.getJournalEntries();
        if (all != null && !all.isEmpty()) {
            return new ResponseEntity<>(all, HttpStatus.OK);
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @GetMapping("/sentiments")
    @Operation(summary = "Get sentiment options", description = "Returns available sentiments for journal entry selection")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Sentiment options retrieved successfully")
    })
    public ResponseEntity<List<String>> getSentimentOptions() {
        return new ResponseEntity<>(journalOptionService.getSentimentOptions(), HttpStatus.OK);
    }

    @PostMapping
    @Operation(summary = "Create new journal entry", description = "Creates a new journal entry for authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Journal entry created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<JournalEntry> createEntry(@RequestBody JournalEntry myEntry) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userName = authentication.getName();
            myEntry.setEntryDate(LocalDateTime.now());
            JournalEntry savedEntry = journalEntryService.saveEntry(myEntry, userName);
            return new ResponseEntity<>(savedEntry, HttpStatus.CREATED);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping("/{myId:[0-9a-fA-F]{24}}")
    @Operation(summary = "Get journal entry by ID", description = "Retrieves journal entry or user profile by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Journal entry or user profile found"),
            @ApiResponse(responseCode = "404", description = "Entry or user not found")
    })
    public ResponseEntity<?> getByID(@Parameter(description = "Journal entry ID or User ID")
                                     @PathVariable String myId) {
        ObjectId id = new ObjectId(myId);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByname(userName);

        List<JournalEntry> collect = user.getJournalEntries().stream()
                .filter(x -> x.getId().equals(id)).collect(Collectors.toList());

        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findByID(id);
            if (journalEntry.isPresent()) {
                return new ResponseEntity<>(journalEntry.get(), HttpStatus.OK);
            }
        }

        if (user.getId().equals(myId)) {
            List<JournalEntry> allEntries = user.getJournalEntries();
            if (allEntries != null && !allEntries.isEmpty()) {
                return new ResponseEntity<>(allEntries, HttpStatus.OK);
            }
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @DeleteMapping("/{myId:[0-9a-fA-F]{24}}")
    @Operation(summary = "Delete journal entry by ID", description = "Deletes journal entry for authenticated user")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Journal entry deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Journal entry not found")
    })
    public ResponseEntity<Void> deleteByID(@Parameter(description = "Journal entry ID")
                                           @PathVariable String myId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        boolean removed = journalEntryService.deleteByID(new ObjectId(myId), userName);
        return new ResponseEntity<>(removed ? HttpStatus.NO_CONTENT : HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{myId:[0-9a-fA-F]{24}}")
    @Operation(summary = "Update journal entry by ID", description = "Partially updates journal entry")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Journal entry updated successfully"),
            @ApiResponse(responseCode = "404", description = "Journal entry not found")
    })
    public ResponseEntity<JournalEntry> updateJournalById(@Parameter(description = "Journal entry ID")
                                                          @PathVariable String myId,
                                                          @RequestBody JournalEntry newEntry) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userName = authentication.getName();
        User user = userService.findByname(userName);
        ObjectId entryId = new ObjectId(myId);

        List<JournalEntry> collect = user.getJournalEntries().stream()
                .filter(x -> x.getId().equals(entryId)).collect(Collectors.toList());

        if (!collect.isEmpty()) {
            Optional<JournalEntry> journalEntry = journalEntryService.findByID(entryId);
            if (journalEntry.isPresent()) {
                JournalEntry old = journalEntry.get();
                old.setTitle(newEntry.getTitle() != null ? newEntry.getTitle() : old.getTitle());
                old.setContent(newEntry.getContent() != null ? newEntry.getContent() : old.getContent());
                if (newEntry.getSentiment() != null) {
                    old.setSentiment(newEntry.getSentiment());
                }
                JournalEntry savedEntry = journalEntryService.saveEntry(old, userName);
                return new ResponseEntity<>(savedEntry, HttpStatus.OK);
            }
        }
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }
}
