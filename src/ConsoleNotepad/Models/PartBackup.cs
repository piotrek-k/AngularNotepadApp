using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.Models
{
    public class PartBackup
    {
        public PartBackup(Part partToCopy)
        {
            Type = partToCopy.Type;
            Data = partToCopy.Data;
            SettingsAsJSON = partToCopy.SettingsAsJSON;
            OrderPosition = partToCopy.OrderPosition;
            OriginalPartID = partToCopy.ID;
            DateOfMakingBackup = DateTime.Now;
        }

        public int ID { get; set; }
        public int Type { get; set; }
        public string Data { get; set; } /*Dane części notatki, zawartość wprowadzona przez użytkownika*/
        public string SettingsAsJSON { get; set; } /*Ustawienia wyświetlania*/
        public int OrderPosition { get; set; }

        public DateTime? DateOfMakingBackup { get; set; }
        
        [ForeignKey("OriginalPart")]
        public int OriginalPartID { get; set; }
        public virtual Part OriginalPart { get; set; }
    }
}
