package com.antiz.journalApp.repository;

import com.antiz.journalApp.entity.JournalEntry;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface JournalEntryRepository extends MongoRepository<JournalEntry, ObjectId> {

    // using mongo Repo: it is an interface have many built in methods like inserting docunment and retriving multiple docus.
    // pass two parameter -> id, object


}
