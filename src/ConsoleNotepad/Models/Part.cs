using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class Part
    {
        public Part()
        {
            CreationDate = DateTime.Now;
        }

        public int ID { get; set; }
        public int Type { get; set; }
        public string Data { get; set; }
        public DateTime? CreationDate { get; set; }

        [ForeignKey("Note")]
        public int NoteID { get; set; }
        public virtual Note Note { get; set; }
    }
}
