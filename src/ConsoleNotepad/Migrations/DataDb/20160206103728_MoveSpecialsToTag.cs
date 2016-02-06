using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;
using ConsoleNotepad.Models;

namespace ConsoleNotepad.Migrations.DataDb
{
    public partial class MoveSpecialsToTag : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Note_NoteId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Tag_TagId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_Part_Note_NoteID", table: "Part");
            migrationBuilder.DropColumn(name: "Special", table: "Tag");
            migrationBuilder.DropColumn(name: "TypeOfNote", table: "Note");
            migrationBuilder.AddColumn<int>(
                name: "Type",
                table: "Tag",
                nullable: false,
                defaultValue: Tag.SpecialTypes.Normal);
            migrationBuilder.AddForeignKey(
                name: "FK_NoteTag_Note_NoteId",
                table: "NoteTag",
                column: "NoteId",
                principalTable: "Note",
                principalColumn: "NoteId",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_NoteTag_Tag_TagId",
                table: "NoteTag",
                column: "TagId",
                principalTable: "Tag",
                principalColumn: "TagId",
                onDelete: ReferentialAction.Cascade);
            migrationBuilder.AddForeignKey(
                name: "FK_Part_Note_NoteID",
                table: "Part",
                column: "NoteID",
                principalTable: "Note",
                principalColumn: "NoteId",
                onDelete: ReferentialAction.Cascade);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Note_NoteId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Tag_TagId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_Part_Note_NoteID", table: "Part");
            migrationBuilder.DropColumn(name: "Type", table: "Tag");
            migrationBuilder.AddColumn<bool>(
                name: "Special",
                table: "Tag",
                nullable: false,
                defaultValue: false);
            migrationBuilder.AddColumn<int>(
                name: "TypeOfNote",
                table: "Note",
                nullable: false,
                defaultValue: 0);
            migrationBuilder.AddForeignKey(
                name: "FK_NoteTag_Note_NoteId",
                table: "NoteTag",
                column: "NoteId",
                principalTable: "Note",
                principalColumn: "NoteId",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_NoteTag_Tag_TagId",
                table: "NoteTag",
                column: "TagId",
                principalTable: "Tag",
                principalColumn: "TagId",
                onDelete: ReferentialAction.Restrict);
            migrationBuilder.AddForeignKey(
                name: "FK_Part_Note_NoteID",
                table: "Part",
                column: "NoteID",
                principalTable: "Note",
                principalColumn: "NoteId",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
