package com.antiz.journalApp.api.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.List;


@Data
public class WeatherResponse {
    private Current current;

    @Data
    public class Current {
        @JsonProperty("temperature")
        private int temperature;
        @JsonProperty("weather_descriptions")
        private List<String> weather_descriptions;
        @JsonProperty("feelslike")
        private int feelslike;

    }


}
