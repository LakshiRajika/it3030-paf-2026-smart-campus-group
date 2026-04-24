package com.smartcampus.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "ticket_comments")
public class TicketComment {

    @Id
    private String id;
    
    private String ticketId;
    private String authorId;
    private String authorName;
    private String content;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public TicketComment() {}

    public static class TicketCommentBuilder {
        private TicketComment comment = new TicketComment();
        public TicketCommentBuilder ticketId(String ticketId) { comment.ticketId = ticketId; return this; }
        public TicketCommentBuilder authorId(String authorId) { comment.authorId = authorId; return this; }
        public TicketCommentBuilder authorName(String authorName) { comment.authorName = authorName; return this; }
        public TicketCommentBuilder content(String content) { comment.content = content; return this; }
        public TicketCommentBuilder createdAt(LocalDateTime createdAt) { comment.createdAt = createdAt; return this; }
        public TicketCommentBuilder updatedAt(LocalDateTime updatedAt) { comment.updatedAt = updatedAt; return this; }
        public TicketComment build() { return comment; }
    }

    public static TicketCommentBuilder builder() { return new TicketCommentBuilder(); }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
