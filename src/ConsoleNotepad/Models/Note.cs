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

        public int ID { get; set; }
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
                var tags = this.NoteTags.Select(x => x.Tag);
                //if (NoteTags != null)
                //{
                //    foreach (var nt in NoteTags)
                //    {
                //        result += nt.Tag.Name + " ";
                //    }
                //}
                foreach (var t in tags)
                {
                    result += t.Name + " ";
                }
                return result;
            }
        }
    }
}
