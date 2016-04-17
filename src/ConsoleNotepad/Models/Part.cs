using ConsoleNotepad.OtherClasses;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class Part : IContainsLastModified
    {
        public Part()
        {
            CreationDate = DateTime.Now;
            LastTimeModified = DateTime.Now;
            PartHistory = new HashSet<PartBackup>();
        }

        public int ID { get; set; }
        //public int Type { get; set; } /*Tag.SpecialTypes*/
        public string Data { get; set; } /*Dane części notatki, zawartość wprowadzona przez użytkownika*/
        public string SettingsAsJSON { get; set; } /*Ustawienia wyświetlania*/
        public DateTime? CreationDate { get; set; }

        public int OrderPosition { get; set; }

        public DateTime? LastTimeModified { get; set; }

        [ForeignKey("Note")]
        public int NoteID { get; set; }
        public virtual Note Note { get; set; }

        public virtual ICollection<PartBackup> PartHistory { get; set; }
    }
}
