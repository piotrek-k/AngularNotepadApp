using Microsoft.Data.Entity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class DataDbContext : DbContext
    {
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<NoteTag>()
                .HasKey(t => new { t.NoteId, t.TagId });

            modelBuilder.Entity<NoteTag>()
                .HasOne(pt => pt.Note)
                .WithMany(p => p.NoteTags)
                .HasForeignKey(pt => pt.NoteId);

            modelBuilder.Entity<NoteTag>()
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.NoteTags)
                .HasForeignKey(pt => pt.TagId);
            //base.OnModelCreating(modelBuilder);
            //modelBuilder.Entity<NoteTag>().HasKey(x => new { x.NoteId, x.TagId });
        }

        public DataDbContext()
        {
            //this.Configuration.LazyLoadingEnabled = false;
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Part> Parts { get; set; }
    }
}
