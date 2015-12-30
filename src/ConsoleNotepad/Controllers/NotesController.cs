using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using ConsoleNotepad.Models;
using System;

namespace ConsoleNotepad.Controllers
{
    [Produces("application/json")]
    [Route("api/Notes")]
    public class NotesController : Controller
    {
        private DataDbContext db;

        public NotesController(DataDbContext context)
        {
            db = context;
        }

        // GET: api/Notes
        [HttpGet]
        public IEnumerable<Note> GetNotes()
        {
            return db.Notes;
        }

        [HttpGet("/suggest/{searchText}", Name = "Suggest")]
        public IEnumerable<Note> GetSuggestedNotes(string searchText)
        {
            //TODO: Podpowiedzi przy wpisywaniu tytu³u
            return db.Notes;
        }

        // GET: api/Notes/5
        [HttpGet("{id}", Name = "GetNote")]
        public IActionResult GetNote([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Note note = db.Notes.Single(m => m.ID == id);

            if (note == null)
            {
                return HttpNotFound();
            }

            return Ok(note);
        }

        // PUT: api/Notes/5
        [HttpPut("{id}")]
        public IActionResult PutNote(int id, [FromBody] Note note)
        {
            //edytowalne tylko tagi

            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            if (id != note.ID)
            {
                return HttpBadRequest();
            }

            //db.Entry(note).State = EntityState.Modified;

            Note noteInDb = db.Notes.FirstOrDefault(x => x.ID == note.ID);
            if (note.TagsToAdd != "" && note.TagsToAdd != null)
            {
                noteInDb.NoteTags = new List<NoteTag>();

                string[] separators = { " " };
                List<string> tags = note.TagsToAdd.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();
                foreach (var t in tags)
                {
                    Tag tagInDb = db.Tags.FirstOrDefault(x => x.Name == t);

                    if (tagInDb == null)
                    {
                        tagInDb = db.Tags.Add(new Tag { Name = t }).Entity;
                    }

                    note.NoteTags.Add(new NoteTag { Tag = tagInDb });
                }
            }

            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!NoteExists(id))
                {
                    return HttpNotFound();
                }
                else
                {
                    throw;
                }
            }

            return new HttpStatusCodeResult(StatusCodes.Status204NoContent);
        }

        // POST: api/Notes
        [HttpPost]
        public IActionResult PostNote([FromBody] Note note)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            string[] separators = { " " };
            List<string> tags = note.TagsToAdd.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();
            foreach (var t in tags)
            {
                Tag tagInDb = db.Tags.FirstOrDefault(x => x.Name == t);

                if (tagInDb == null)
                {
                    tagInDb = db.Tags.Add(new Tag { Name = t }).Entity;
                }

                note.NoteTags.Add(new NoteTag { Tag = tagInDb });
            }

            db.Notes.Add(note);
            try
            {
                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (NoteExists(note.ID))
                {
                    return new HttpStatusCodeResult(StatusCodes.Status409Conflict);
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("GetNote", new { id = note.ID }, note);
        }

        // DELETE: api/Notes/5
        [HttpDelete("{id}")]
        public IActionResult DeleteNote(int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Note note = db.Notes.Single(m => m.ID == id);
            if (note == null)
            {
                return HttpNotFound();
            }

            db.Notes.Remove(note);
            db.SaveChanges();

            return Ok(note);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                db.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool NoteExists(int id)
        {
            return db.Notes.Count(e => e.ID == id) > 0;
        }
    }
}