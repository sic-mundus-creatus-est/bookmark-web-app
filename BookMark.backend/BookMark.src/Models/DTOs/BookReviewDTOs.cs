using System.ComponentModel.DataAnnotations;

namespace BookMark.Models.DTOs;

public record BookReviewCreateDTO
{
    [Required]
    public required string BookId { get; init; }

    [Range(1, 5)]
    public int? Rating { get; init; }
    [MaxLength(2000)]
    public string? Content { get; init; }
}

public record BookReviewResponseDTO
{
    public required UserLinkDTO User { get; init; }
    public required string BookId { get; init; }
    public required string BookTitle { get; init; }
    public required string BookCoverImageUrl { get; set; }
    public int? Rating { get; init; }
    public string? Content { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record BookReviewStatsDTO
{
    public double? AverageRating { get; init; }
    public int? ReviewCount { get; init; }
}
