package main.java.fr.ubo.djf.services;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SmsRequest {
    private String to;
    private String message;
}
