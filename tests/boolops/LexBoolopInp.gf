
instance LexBoolopInp of LexBoolop = open Prelude in
  {
  oper
    CFtemplate x = x.s ++ " is (( if " ++ x.s ++ " begin ))" ++ (b2s x.b) ++ "(( end ))(( unless " ++ x.s ++ " begin ))wrong!((end))";
}
