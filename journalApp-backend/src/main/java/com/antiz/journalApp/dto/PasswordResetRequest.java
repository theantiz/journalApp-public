package com.antiz.journalApp.dto;

import javax.validation.constraints.NotEmpty;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PasswordResetRequest {

    @NotEmpty
    @Schema(description = "Username or email to reset password for")
    private String usernameOrEmail;

    @NotEmpty
    @Schema(description = "OTP received via email")
    private String otp;

    @NotEmpty
    @Schema(description = "New password")
    private String newPassword;
}
