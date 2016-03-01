using System;
using Microsoft.Data.Entity;
using Microsoft.Data.Entity.Infrastructure;
using Microsoft.Data.Entity.Metadata;
using Microsoft.Data.Entity.Migrations;
using ConsoleNotepad.Models;

namespace ConsoleNotepad.Migrations
{
    [DbContext(typeof(DataDbContext))]
    partial class DataDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
            modelBuilder
                .HasAnnotation("ProductVersion", "7.0.0-rc1-16348")
                .HasAnnotation("SqlServer:ValueGenerationStrategy", SqlServerValueGenerationStrategy.IdentityColumn);

            modelBuilder.Entity("ConsoleNotepad.Models.Note", b =>
                {
                    b.Property<int>("NoteId")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("AuthorId");

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

                    b.Property<DateTime?>("LastTimeModified");

                    b.Property<int>("NoteID");

                    b.Property<int>("OrderPosition");

                    b.Property<string>("SettingsAsJSON");

                    b.Property<int>("Type");

                    b.HasKey("ID");
                });

            modelBuilder.Entity("ConsoleNotepad.Models.PartBackup", b =>
                {
                    b.Property<int>("ID")
                        .ValueGeneratedOnAdd();

                    b.Property<string>("Data");

                    b.Property<DateTime?>("DateOfMakingBackup");

                    b.Property<int>("OrderPosition");

                    b.Property<int>("OriginalPartID");

                    b.Property<string>("SettingsAsJSON");

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

            modelBuilder.Entity("ConsoleNotepad.Models.PartBackup", b =>
                {
                    b.HasOne("ConsoleNotepad.Models.Part")
                        .WithMany()
                        .HasForeignKey("OriginalPartID");
                });
        }
    }
}
