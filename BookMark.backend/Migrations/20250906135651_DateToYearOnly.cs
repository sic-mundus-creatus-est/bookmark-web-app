using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace BookMark.backend.Migrations
{
    /// <inheritdoc />
    public partial class DateToYearOnly : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthDate",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "DeathDate",
                table: "Authors");

            migrationBuilder.AddColumn<int>(
                name: "BirthYear",
                table: "Authors",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "DeathYear",
                table: "Authors",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BirthYear",
                table: "Authors");

            migrationBuilder.DropColumn(
                name: "DeathYear",
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
    }
}
