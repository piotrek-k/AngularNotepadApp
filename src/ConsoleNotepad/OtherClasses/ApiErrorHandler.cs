using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ConsoleNotepad.OtherClasses
{
    public class ApiRequestHandler
    {
        public enum Types
        {
            DoneSuccessfully,
            UnknownErrorOcurred,
            TooManySpecialTags,
            NoteAlreadyExists,
            CannotAddMoreThanOnePart
        };
    }
}
