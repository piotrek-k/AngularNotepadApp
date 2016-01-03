using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using ConsoleNotepad.Models;
using System;
using Newtonsoft.Json;

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
         
        //[Route("/api/Notes/suggest/{searchText}")]
        [HttpGet("/api/notes/suggested", Name = "GetSuggested")]
        public IActionResult GetSuggestedNotes(string searchText)
        {
            string[] separators = { " " };
            List<string> tags = searchText.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();

            //var allNotes = db.Notes.Where(dbnote => tags.All(givenTag => dbnote.NoteTags.Any(dbNoteTag => dbNoteTag.Tag.Name == givenTag))).Include(x => x.NoteTags).ThenInclude(x => x.Tag);
            var allNotes = db.Notes;
                //.Include(x => x.NoteTags).ThenInclude(x => x.Tag);
            var allNotes2 = allNotes.Where(dbnote => tags.All(givenTag => dbnote.NoteTags.Any(dbNoteTag => dbNoteTag.Tag.Name == givenTag)));
            //var allNotes2 = allNotes.Where(x => x);

            var dataToList = allNotes2.ToList();

            //List<NoteTag> convertedToNT = new List<NoteTag>();
            //foreach(var t in tags)
            //{
            //    convertedToNT.Add(new NoteTag
            //    {
            //        Tag = new Tag { Name = t }
            //    });
            //}
            //var dataToList1 = db.Notes.Where(x => tags.All(y => x.NoteTags.Any(z => z.Tag.Name == y)));
            //var test = dataToList1.ToList();
            //var dataToList = dataToList1.Include(x => x.NoteTags).ThenInclude(x => x.Tag).ToList();

            return Ok(JsonConvert.SerializeObject(dataToList, Formatting.Indented, new JsonSerializerSettings
            {
                PreserveReferencesHandling = PreserveReferencesHandling.Objects,
            }));
        }

        // GET: api/Notes/5
        [HttpGet("{id}", Name = "GetNote")]
        public IActionResult GetNote([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Note note = db.Notes.Single(m => m.NoteId == id);

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

            if (id != note.NoteId)
            {
                return HttpBadRequest();
            }

            //db.Entry(note).State = EntityState.Modified;

            Note noteInDb = db.Notes.FirstOrDefault(x => x.NoteId == note.NoteId);
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
                if (NoteExists(note.NoteId))
                {
                    return new HttpStatusCodeResult(StatusCodes.Status409Conflict);
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("GetNote", new { id = note.NoteId }, note);
        }

        // DELETE: api/Notes/5
        [HttpDelete("{id}")]
        public IActionResult DeleteNote(int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Note note = db.Notes.Single(m => m.NoteId == id);
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
            return db.Notes.Count(e => e.NoteId == id) > 0;
        }
    }
}