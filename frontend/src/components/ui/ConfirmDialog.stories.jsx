import { useState } from "react";
import { Button } from "@mui/material";
import ConfirmDialog from "./ConfirmDialog";

export default {
  title: "UI/ConfirmDialog",
  component: ConfirmDialog,
};

function InteractiveTemplate() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="contained" color="error" onClick={() => setOpen(true)}>
        Delete car
      </Button>
      <ConfirmDialog
        open={open}
        title="Fshi veturën?"
        message="Ky veprim nuk mund të kthehet mbrapsht."
        confirmText="Fshi"
        cancelText="Anulo"
        onCancel={() => setOpen(false)}
        onConfirm={() => setOpen(false)}
      />
    </>
  );
}

export const Interactive = {
  render: () => <InteractiveTemplate />,
};
