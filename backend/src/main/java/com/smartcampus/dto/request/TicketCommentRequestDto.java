package com.smartcampus.dto.request;

public class TicketCommentRequestDto {
    private String content;
    private String authorId;
    private String authorName;

    public TicketCommentRequestDto() {}

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
}
