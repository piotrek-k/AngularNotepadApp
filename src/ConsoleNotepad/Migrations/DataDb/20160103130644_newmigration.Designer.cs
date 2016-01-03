using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using ConsoleNotepad.Models;

namespace ConsoleNotepad.Migrations.DataDb
{
    [DbContext(typeof(DataDbContext))]
    [Migration("20160103130644_newmigration")]
    partial class newmigration
    {
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.0-rc1-16348")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("ConsoleNotepad.Models.Note", b =>
                {
                    b.Property<int>("NoteId")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime?>("CreationDate");

                    b.HasKey("NoteId");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.NoteTag", b =>
                {
                    b.Property<int>("NoteId");

                    b.Property<int>("TagId");

                    b.HasKey("NoteId", "TagId");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.Part", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<DateTime?>("CreationDate");

                    b.Property<string>("Data");

                    b.Property<int>("NoteID");

                    b.Property<int>("Type");

                    b.HasKey("ID");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.Tag", b =>
                {
                    b.Property<int>("TagId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Name");

                    b.HasKey("TagId");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.NoteTag", b =>
                {
                    b.HasOne("ConsoleNotepad.Models.Note")
                        .WithMany()
                        .HasForeignKey("NoteId");

                    b.HasOne("ConsoleNotepad.Models.Tag")
                        .WithMany()
                        .HasForeignKey("TagId");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.Part", b =>
                {
                    b.HasOne("ConsoleNotepad.Models.Note")
                        .WithMany()
                        .HasForeignKey("NoteID");
                });
        }
    }
}
