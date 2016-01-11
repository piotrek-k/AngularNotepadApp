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
    [Route("api/Parts")]
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
            var data = _context.Parts.Where(x => x.NoteID == idOfNote).ToList();
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

            _context.Parts.Add(part);
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