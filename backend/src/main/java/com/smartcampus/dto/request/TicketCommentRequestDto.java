package com.smartcampus.dto.request;

import lombok.Data;

@Data
public class TicketCommentRequestDto {
    private String content;
    private String authorId;
    private String authorName;
}
