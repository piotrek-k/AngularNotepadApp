using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class Note
    {
        public Note()
        {
            CreationDate = DateTime.Now;
            NoteTags = new HashSet<NoteTag>();
            Parts = new HashSet<Part>();
        }

        public int NoteId { get; set; }
        public virtual ICollection<NoteTag> NoteTags { get; set; }
        public virtual ICollection<Part> Parts { get; set; }
        public DateTime? CreationDate { get; set; }

        [NotMapped]
        public string TagsToAdd { get; set; }

        [NotMapped]
        public string TagsAsSingleString
        {
            get
            {
                string result = "";
                if (NoteTags != null)
                {
                    foreach (var nt in NoteTags)
                    {
                        if (nt.Tag != null)
                        {
                            result += nt.Tag.Name + " ";
                        }
                    }
                }
                return result;
            }
        }
    }
}
