using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using ConsoleNotepad.Models;
using System;
using Newtonsoft.Json;
using System.Threading.Tasks;
using ConsoleNotepad.OtherClasses;

namespace ConsoleNotepad.Controllers
{
    [Produces("application/json")]
    [Route("api/Notes")]
    public class NotesController : Controller
    {
        private DataDbContext db;

        public enum TypesOfProblems
        {
            TagsOfNotesNotProvided
        }

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
            /*
            * Dzia³a to tak: zwracane s¹ wszystkie notatki, które maj¹ przypisane wszystkie z podanych tagów
            */

            if(searchText == null)
            {
                return HttpBadRequest(TypesOfProblems.TagsOfNotesNotProvided);
            }

            string[] separators = { " " };
            List<string> tags = searchText.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();

            /*
            * Poni¿sze rozwi¹zanie jest skrajnie chujowe i wymaga poprawki, ale nic innego nie dzia³a³o. Trzeba poczekaæ na lepsz¹ edycjê EF7
            * Tak to powinno w teorii wygl¹daæ:
            * var allNotes = db.Notes.Where(dbnote => tags.All(givenTag => dbnote.NoteTags.Any(dbNoteTag => dbNoteTag.Tag.Name == givenTag))).Include(x => x.NoteTags).ThenInclude(x => x.Tag);
            * Niestety “Sequence contains more than one element” cokolwiek to kurwa znaczy
            */

            var allNotes = db.Notes.Include(x => x.NoteTags).ThenInclude(x => x.Tag).ToList();
            List<Note> finalNotes = new List<Note>();
            foreach (var note in allNotes)
            {
                bool allOfThem = true; //note has all of given tags
                foreach (var tag in tags)
                {
                    bool tagExists = false; //tag is in note
                    foreach (var notetag in note.NoteTags)
                    {
                        if (notetag.Tag.Name == tag)
                        {
                            tagExists = true;
                            break;
                        }
                    }
                    if (tagExists == false)
                    {
                        allOfThem = false;
                        break;
                    }
                }
                if (allOfThem == true)
                {
                    finalNotes.Add(note);
                }
            }

            finalNotes = finalNotes.OrderBy(x => x.NoteTags.Count).ToList();

            //trzeba zwolniæ pamiêæ
            foreach (var fn in finalNotes)
            {
                fn.Parts = null;
                foreach (var t in fn.NoteTags)
                {
                    t.Note = null;
                    t.Tag.NoteTags = null;
                }
            }

            return Ok(JsonConvert.SerializeObject(finalNotes, Formatting.Indented, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            }));
        }

        [HttpGet("/api/notes/bytags", Name = "GetByTags")]
        public IActionResult GetNoteByTags(string searchText)
        {
            /*
            * Jedna notatka maj¹ca wszystkie te tagi i ani jednego taga wiêcej
            */
            if (searchText == null)
            {
                searchText = "";
            }

            string[] separators = { " " };
            List<string> tags = searchText.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();

            /*
            * Poni¿sze rozwi¹zanie jest skrajnie chujowe i wymaga poprawki, ale nic innego nie dzia³a³o. Trzeba poczekaæ na lepsz¹ edycjê EF7
            * Tak to powinno w teorii wygl¹daæ:
            * var allNotes = db.Notes.Where(dbnote => tags.All(givenTag => dbnote.NoteTags.Any(dbNoteTag => dbNoteTag.Tag.Name == givenTag))).Include(x => x.NoteTags).ThenInclude(x => x.Tag);
            * Niestety “Sequence contains more than one element” cokolwiek to kurwa znaczy
            * EDIT: 5/2/2016: podejrzewam ¿e problemem jest to, ¿e NoteTags jest po prostu pusty. Jakby daæ ToList() to mo¿e bêdzie dzia³aæ, chocia¿ to pewnie nie jest dobry pomys³ trzymaæ to wszystko w pamiêci...
            */


            var allNotes = db.Notes.Include(x => x.NoteTags).ThenInclude(x => x.Tag).Where(x => x.NoteTags.Count == tags.Count).ToList();
            List<Note> finalNotes = new List<Note>();
            foreach (var note in allNotes)
            {
                //if(allNotes.)
                bool allOfThem = true; //note has all of given tags
                foreach (var tag in tags)
                {
                    bool tagExists = false; //tag is in note
                    foreach (var notetag in note.NoteTags)
                    {
                        if (notetag.Tag.Name == tag)
                        {
                            tagExists = true;
                            break;
                        }
                    }
                    if (tagExists == false)
                    {
                        allOfThem = false;
                        break;
                    }
                }
                if (allOfThem == true)
                {
                    finalNotes.Add(note);
                }
            }

            if (finalNotes.Count > 1)
            {
                return new HttpStatusCodeResult(StatusCodes.Status500InternalServerError);
            }

            var finalResult = finalNotes.FirstOrDefault();

            if(finalResult == null)
            {
                return HttpNotFound();
            }

            //if (finalResult == null)
            //{
            //    //brak takiej notatki w bazie. utworz j¹
            //    int idOfNewNote = PostNote(new Note
            //    {
            //        TagsToAdd = searchText
            //    });

            //    //jesli nie ma zadnych partow, dodaj
            //    if (db.Notes.First(x => x.NoteId == idOfNewNote).NoteTags.Count() == 0)
            //    {
            //        db.Parts.Add(new Part
            //        {
            //            Data = "Nowa notatka",
            //            NoteID = idOfNewNote
            //        });
            //    }

            //    finalResult = db.Notes.First(x => x.NoteId == idOfNewNote);
            //}

            return Ok(JsonConvert.SerializeObject(finalResult, Formatting.Indented, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
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
            //aby dodaæ tagi nale¿y wpisaæ je w "TagsToAdd"

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

                //string[] separators = { " " };
                //List<string> tags = note.TagsToAdd.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();
                //foreach (var t in tags)
                //{
                //    Tag tagInDb = db.Tags.FirstOrDefault(x => x.Name == t);

                //    if (tagInDb == null)
                //    {
                //        tagInDb = db.Tags.Add(new Tag(t)).Entity;
                //    }

                //    note.NoteTags.Add(new NoteTag { Tag = tagInDb });
                //}
                noteInDb = TagsToAddToTags(note);
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
            //wymagane: TagsToAdd (doda NoteTags)

            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
                //return -1;
            }

            note = TagsToAddToTags(note);

            if(db.Notes.Include(x => x.NoteTags).ToList().Any(x => Functions.CheckIfListsAreEqual(x.ArrayWithTagsID, note.ArrayWithTagsID)))
            {
                return new HttpStatusCodeResult(StatusCodes.Status409Conflict);
            }

            db.Notes.Add(note);

            try
            {
                db.SaveChanges();

                db.Parts.Add(new Part
                {
                    Data = "Nowa notatka",
                    NoteID = note.NoteId
                });

                db.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (NoteExists(note.NoteId))
                {
                    return new HttpStatusCodeResult(StatusCodes.Status409Conflict);
                    //return -1;
                }
                else
                {
                    throw;
                }
            }

            //return CreatedAtRoute("GetNote", new { id = note.NoteId }, note);
            return Ok();
            //return note.NoteId;
        }

        public Note TagsToAddToTags(Note note)
        {
            //odczytuje obiekt TagsToAdd i konwertuje jego dane do realnych Tagów z bazy danych

            string[] separators = { " " };
            List<string> tags = note.TagsToAdd.Split(separators, StringSplitOptions.RemoveEmptyEntries).ToList();
            note.NoteTags = new List<NoteTag>();
            //note.TypeOfNote = Note.SpecialTypes.Normal;
            note.TooManySpecialTags = false;
            foreach (var t in tags)
            {
                Tag tagInDb = db.Tags.FirstOrDefault(x => x.Name == t);

                if (tagInDb == null)
                {
                    tagInDb = db.Tags.Add(new Tag { Name = t }).Entity;
                }

                //if (tagInDb.Special)
                //{
                //    if(note.TypeOfNote != Note.SpecialTypes.Normal) //wartoœæ zosta³a ju¿ przypisana!
                //    {
                //        note.TooManySpecialTags = true;
                //    }
                //    note.TypeOfNote = StringToSpecialsConversion(tagInDb.Name);
                //}

                note.NoteTags.Add(new NoteTag { Tag = tagInDb });
            }

            //w tym momencie notatka ma ju¿ nowe tagi

            return note;
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