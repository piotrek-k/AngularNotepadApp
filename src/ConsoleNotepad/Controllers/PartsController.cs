using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNet.Http;
using Microsoft.AspNet.Mvc;
using Microsoft.Data.Entity;
using ConsoleNotepad.Models;
using System;
using Microsoft.AspNet.Authorization;
using Newtonsoft.Json;

namespace ConsoleNotepad.Controllers
{
    [Produces("application/json")]
    [Route("api/Parts")]
    [Authorize("Bearer")]
    public class PartsController : Controller
    {
        private DataDbContext _context;

        public PartsController(DataDbContext context)
        {
            _context = context;
        }

        // GET: api/Parts
        [HttpGet]
        public IActionResult GetParts(int idOfNote)
        {
            //usun puste party
            var a = _context.Parts.Where(x => x.NoteID == idOfNote && (String.IsNullOrWhiteSpace(x.Data) || x.Data == "&nbsp;") && (x.SettingsAsJSON == null || x.SettingsAsJSON == "{}"));
            var count = a.Count();
            if (a.Count() < 100)
            {
                _context.Parts.RemoveRange(a);
                _context.SaveChanges();
            }
            else
            {
                //niebezpiecznie duzo partsow do usuniecia
                return Json(new { Error = "Zbyt duzo obiektów typu Part do usuniêcia. " + a.Count() });
            }


            var data = _context.Parts.Where(x => x.NoteID == idOfNote).OrderBy(x => x.OrderPosition).ToList();
            return Ok(data);
        }

        // GET: api/Parts/5
        [HttpGet("{id}", Name = "GetPart")]
        public IActionResult GetPart([FromRoute] int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Part part = _context.Parts.Single(m => m.ID == id);

            if (part == null)
            {
                return HttpNotFound();
            }

            return Ok(part);
        }

        [HttpGet("/api/partshistory")]
        public IActionResult GetPartHistory(int idOfOriginalPart, int page)
        {
            int pageSize = 10;
            if(page < 1) { page = 1; }

            var history = _context.PartBackups.Where(x => x.OriginalPartID == idOfOriginalPart).Include(x=>x.OriginalPart).OrderBy(x => x.DateOfMakingBackup).Skip(pageSize*(page-1)).Take(pageSize).ToList();
            foreach(var h in history)
            {
                h.OriginalPart.PartHistory = null; //nie przesy³aj wiêcej danych
            }
            return Ok(JsonConvert.SerializeObject(history, Formatting.Indented, new JsonSerializerSettings
            {
                ReferenceLoopHandling = ReferenceLoopHandling.Ignore
            }));
        }

        // PUT: api/Parts/5
        [HttpPut("{id}")]
        public IActionResult PutPart(int id, [FromBody] Part part)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            if (id != part.ID)
            {
                return HttpBadRequest();
            }

            DateTime? lastMod = _context.Parts.AsNoTracking().Where(x => x.ID == part.ID).FirstOrDefault().LastTimeModified;
            DateTime comparationDate = DateTime.Now.AddHours(-4);
            if (lastMod < comparationDate) //jeœli poprzednia modyfikacja by³a ju¿ dawno, zrób kopiê
            {
                PartBackup newPB = new PartBackup();
                newPB.Define(_context.Entry(part).Entity);
                _context.Add(newPB);
            }

            part.LastTimeModified = DateTime.Now;

            _context.Entry(part).State = EntityState.Modified;

            try
            {
                _context.SaveChanges();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!PartExists(id))
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

        // POST: api/Parts
        [HttpPost]
        public IActionResult PostPart([FromBody] Part part)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            if (part.ID == -1)
            {
                return new HttpStatusCodeResult(StatusCodes.Status404NotFound);
            }

            _context.Parts.Add(part);

            //change order
            var partsThatAreLaterInList = _context.Parts.Where(x => x.NoteID == part.NoteID && x.OrderPosition >= part.OrderPosition).ToList();
            partsThatAreLaterInList.ForEach(x => x.OrderPosition++);

            try
            {
                _context.SaveChanges();
            }
            catch (DbUpdateException)
            {
                if (PartExists(part.ID))
                {
                    return new HttpStatusCodeResult(StatusCodes.Status409Conflict);
                }
                else
                {
                    throw;
                }
            }

            return CreatedAtRoute("GetPart", new { id = part.ID }, part);
        }

        // DELETE: api/Parts/5
        [HttpDelete("{id}")]
        public IActionResult DeletePart(int id)
        {
            if (!ModelState.IsValid)
            {
                return HttpBadRequest(ModelState);
            }

            Part part = _context.Parts.Single(m => m.ID == id);
            if (part == null)
            {
                return HttpNotFound();
            }

            _context.Parts.Remove(part);
            _context.SaveChanges();

            return Ok(part);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _context.Dispose();
            }
            base.Dispose(disposing);
        }

        private bool PartExists(int id)
        {
            return _context.Parts.Count(e => e.ID == id) > 0;
        }
    }
}