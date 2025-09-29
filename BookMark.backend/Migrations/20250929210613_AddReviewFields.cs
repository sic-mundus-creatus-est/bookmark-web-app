using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookMark.backend.Migrations
{
    /// <inheritdoc />
    public partial class AddReviewFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "BookReviews",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Rating",
                table: "BookReviews",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Content",
                table: "BookReviews");

            migrationBuilder.DropColumn(
                name: "Rating",
                table: "BookReviews");
        }
    }
}
