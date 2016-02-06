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
        public virtual ICollection<NoteTag> NoteTags { get; set; } //nie da się edytować poprzez API. Używaj TagsToAdd
        public virtual ICollection<Part> Parts { get; set; }
        public DateTime? CreationDate { get; set; }

        [NotMapped]
        public Tag.SpecialTypes TypeOfNote
        {
            get
            {
                int numberOfSpecials = 0;
                Tag.SpecialTypes toReturn = Tag.SpecialTypes.Normal;
                foreach(var x in NoteTags)
                {
                    if(x.Tag.Type != Tag.SpecialTypes.Normal)
                    {
                        numberOfSpecials++;
                        toReturn = x.Tag.Type;
                    }

                    if(numberOfSpecials > 1)
                    {
                        TooManySpecialTags = true;
                        break;
                    }
                }
                return toReturn;
            }
        }

        [NotMapped]
        public string TagsToAdd { get; set; } //podawane w metodzie POST żeby uzupełnić tagi

        [NotMapped]
        public string TagsAsSingleString //zwraca wszystkie tagi jako jeden string
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

        [NotMapped]
        public List<int> ArrayWithTagsID
        {
            get
            {
                List<int> result = new List<int>();
                if (NoteTags != null)
                {
                    foreach (var nt in NoteTags)
                    {
                        if (nt.Tag != null)
                        {
                            result.Add(nt.Tag.TagId);
                        }
                    }
                }
                return result;
            }
        }

        [NotMapped]
        public bool TooManySpecialTags { get; set; }

    }
}
