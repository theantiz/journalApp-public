package com.antiz.journalApp.service;

import com.antiz.journalApp.entity.ConfigJournalAppEntity;
import com.antiz.journalApp.enums.Sentiment;
import com.antiz.journalApp.repository.ConfigJournalAppRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class JournalOptionService {

    private static final String SENTIMENTS_KEY = "journal_sentiments";
    private static final Set<String> VALID_SENTIMENTS = Arrays.stream(Sentiment.values())
            .map(Enum::name)
            .collect(Collectors.toCollection(LinkedHashSet::new));

    @Autowired
    private ConfigJournalAppRepository configJournalAppRepository;

    public List<String> getSentimentOptions() {
        return configJournalAppRepository.findByKey(SENTIMENTS_KEY)
                .map(ConfigJournalAppEntity::getValue)
                .map(this::parseSentimentOptions)
                .filter(options -> !options.isEmpty())
                .orElseGet(() -> List.copyOf(VALID_SENTIMENTS));
    }

    private List<String> parseSentimentOptions(String rawValue) {
        if (!StringUtils.hasText(rawValue)) {
            return List.of();
        }

        return Arrays.stream(rawValue.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(value -> value.toUpperCase(Locale.ROOT))
                .filter(VALID_SENTIMENTS::contains)
                .distinct()
                .collect(Collectors.toList());
    }
}
