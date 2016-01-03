using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class NoteTag
    {
        public int NoteId { get; set; }
        public virtual Note Note { get; set; }

        public int TagId { get; set; }
        public virtual Tag Tag { get; set; }
    }
}
