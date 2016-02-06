using System;
using System.Collections.Generic;
using Microsoft.Data.Entity.Migrations;

namespace ConsoleNotepad.Migrations.DataDb
{
    public partial class TagsPoprawka : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Note_NoteId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_NoteTag_Tag_TagId", table: "NoteTag");
            migrationBuilder.DropForeignKey(name: "FK_Part_Note_NoteID", table: "Part");
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
