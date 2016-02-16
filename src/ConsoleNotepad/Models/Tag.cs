using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class Tag
    {
        public Tag()
        {
            NoteTags = new HashSet<NoteTag>();
        }

        public int TagId { get; set; }
        public string Name { get; set; }

        [NotMapped]
        public SpecialTypes Type
        {
            get
            {
                return StringToSpecialsConversion(Name);
            }
        }

        public virtual ICollection<NoteTag> NoteTags { get; set; }


        public enum SpecialTypes
        {
            Normal,
            Code,
            View,
            System
        }

        public SpecialTypes StringToSpecialsConversion(string name)
        {
            switch (name)
            {
                case "!code":
                    return SpecialTypes.Code;
                case "!view":
                    return SpecialTypes.View;
                case "!system":
                    return SpecialTypes.System;
            }
            return SpecialTypes.Normal;
        }
    }
}
