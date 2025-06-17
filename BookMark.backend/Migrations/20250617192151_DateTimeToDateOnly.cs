using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookMark.backend.Migrations
{
    /// <inheritdoc />
    public partial class DateTimeToDateOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DateOfBirth",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "DateOfDeath",
                table: "Authors");

            migrationBuilder.AddColumn<DateOnly>(
                name: "BirthDate",
                table: "Authors",
                type: "date",
                nullable: true);

            migrationBuilder.AddColumn<DateOnly>(
                name: "DeathDate",
                table: "Authors",
                type: "date",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "DeathDate",
                table: "Authors");

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfBirth",
                table: "Authors",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "DateOfDeath",
                table: "Authors",
                type: "datetime2",
                nullable: true);
        }
    }
}
