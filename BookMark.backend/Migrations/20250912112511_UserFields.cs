using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookMark.backend.Migrations
{
    /// <inheritdoc />
    public partial class UserFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Country",
                table: "AspNetUsers",
                newName: "AboutMe");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "AboutMe",
                table: "AspNetUsers",
                newName: "Country");
        }
    }
}
