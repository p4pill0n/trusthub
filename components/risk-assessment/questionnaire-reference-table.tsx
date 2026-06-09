import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { QUESTIONNAIRE_QUESTIONS } from "@/lib/questionnaire";

export function QuestionnaireReferenceTable() {
  let questionNumber = 0;

  return (
    <div className="rounded-lg border border-border/80 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead className="w-56">Risk area</TableHead>
            <TableHead>Question</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {QUESTIONNAIRE_QUESTIONS.map((question) => {
            questionNumber += 1;
            return (
              <TableRow key={question.id}>
                <TableCell className="text-muted-foreground">{questionNumber}</TableCell>
                <TableCell className="font-medium">{question.category}</TableCell>
                <TableCell>{question.text}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
