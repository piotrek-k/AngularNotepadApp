using ConsoleNotepad.OtherClasses;
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

        public override int SaveChanges()
        {
            /*
             * Aktualizowanie wszystkich zmiennych LastTimeModified
             */
            var changeSet = ChangeTracker.Entries<IContainsLastModified>();
            if(changeSet != null)
            {
                foreach (var entry in changeSet.Where(c => c.State != EntityState.Unchanged))
                {
                    entry.Entity.LastTimeModified = DateTime.Now;
                }
            }
            return base.SaveChanges();
        }

        public DataDbContext()
        {
            //this.Configuration.LazyLoadingEnabled = false;
            Database.EnsureCreated();
            Database.Migrate();
        }

        public DbSet<Note> Notes { get; set; }
        public DbSet<Tag> Tags { get; set; }
        public DbSet<Part> Parts { get; set; }
        public DbSet<NoteTag> NoteTags { get; set; }
        public DbSet<PartBackup> PartBackups { get; set; }
    }
}
