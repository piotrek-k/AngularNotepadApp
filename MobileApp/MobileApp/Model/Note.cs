using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MobileApp.Model
{
    public class RootObject
    {
        public int NoteId { get; set; }
        public List<object> NoteTags { get; set; }
        public List<object> Parts { get; set; }
        public DateTime CreationDate { get; set; }
        public string AuthorId { get; set; }
        public int TypeOfNote { get; set; }
        public string TagsToAdd { get; set; }
        public string TagsAsSingleString { get; set; }
        public List<object> ArrayWithTagsNames { get; set; }
        public bool TooManySpecialTags { get; set; }
    }
}
