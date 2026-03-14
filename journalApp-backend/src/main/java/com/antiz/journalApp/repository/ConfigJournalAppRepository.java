package com.antiz.journalApp.repository;

import com.antiz.journalApp.entity.ConfigJournalAppEntity;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.Optional;

public interface ConfigJournalAppRepository extends MongoRepository<ConfigJournalAppEntity, ObjectId> {

    Optional<ConfigJournalAppEntity> findByKey(String key);
}
