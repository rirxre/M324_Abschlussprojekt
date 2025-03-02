import axios from "axios";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Todo() {
  const [todoList, setTodoList] = useState([]);
  const [editableId, setEditableId] = useState(null);
  const [editedTask, setEditedTask] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [editedDeadline, setEditedDeadline] = useState("");

  // Statusoptionen: Beachte, dass hier die Werte exakt denen im Backend entsprechen müssen.
  // Beispiel: Backend erwartet "open", "in progress", "done"
  // Wir zeigen aber die Labels auf Deutsch an.
  const statusOptions = [
    { label: "Offen", value: "open" },
    { label: "In Bearbeitung", value: "in progress" },
    { label: "Erledigt", value: "done" }
  ];

  useEffect(() => {
    axios
      .get("http://127.0.0.1:3001/getTodoList")
      .then((result) => {
        setTodoList(result.data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Fehler beim Laden der ToDo-Liste!");
      });
  }, []);

  // Funktion, um den Bearbeitungsmodus zu aktivieren und die Felder vorzufüllen
  const editTask = (task) => {
    setEditableId(task._id);
    setEditedTask(task.task);
    setEditedStatus(task.status);
    // Konvertiere Datum in das Format "YYYY-MM-DDTHH:mm" für datetime-local
    const formattedDate = task.deadline
      ? new Date(task.deadline).toISOString().slice(0, 16)
      : "";
    setEditedDeadline(formattedDate);
    console.log("Bearbeiten: ", {
      id: task._id,
      task: task.task,
      status: task.status,
      deadline: formattedDate,
    });
  };

  const addTask = (e) => {
    e.preventDefault();
    if (!newTask || !newStatus || !newDeadline) {
      toast.error("Alle Felder müssen ausgefüllt sein!");
      return;
    }

    axios
      .post("http://127.0.0.1:3001/addTodoList", {
        task: newTask,
        status: newStatus,
        deadline: newDeadline,
      })
      .then(() => {
        toast.success("Aufgabe erfolgreich hinzugefügt!");
        setTimeout(() => window.location.reload(), 1000);
      })
      .catch((err) => {
        console.error("Fehler beim Hinzufügen:", err.response ? err.response.data : err.message);
        toast.error("Fehler beim Hinzufügen der Aufgabe!");
      });
  };

  const saveEditedTask = (id) => {
    if (!editedTask || !editedStatus || !editedDeadline) {
      toast.error("Alle Felder müssen ausgefüllt sein!");
      return;
    }

    console.log("Sende Update: ", {
      task: editedTask,
      status: editedStatus,
      deadline: editedDeadline,
    });

    axios
      .put(`http://127.0.0.1:3001/updateTodoList/${id}`, {
        task: editedTask,
        status: editedStatus,
        deadline: editedDeadline,
      })
      .then((response) => {
        toast.success("Aufgabe erfolgreich aktualisiert!");
        setEditableId(null);
        setTodoList((prevList) =>
          prevList.map((task) => (task._id === id ? response.data : task))
        );
      })
      .catch((err) => {
        console.error("Fehler beim Aktualisieren:", err.response ? err.response.data : err.message);
        toast.error("Fehler beim Aktualisieren der Aufgabe!");
      });
  };

  const deleteTask = (id) => {
    axios
      .delete(`http://127.0.0.1:3001/deleteTodoList/${id}`)
      .then(() => {
        toast.success("Aufgabe erfolgreich gelöscht!");
        setTodoList((prevList) => prevList.filter((task) => task._id !== id));
      })
      .catch((err) => {
        console.error("Fehler beim Löschen:", err.response ? err.response.data : err.message);
        toast.error("Fehler beim Löschen der Aufgabe!");
      });
  };

  return (
    <div className="container mt-5">
      <ToastContainer />
      <div className="row">
        {/* Linke Seite - ToDo Liste */}
        <div className="col-md-7">
          <h2 className="text-center">ToDo Liste</h2>
          <div className="table-responsive">
            <table className="table table-bordered">
              <thead className="table-primary">
                <tr>
                  <th>Aufgabe</th>
                  <th>Status</th>
                  <th>Fällig bis</th>
                  <th>Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {todoList.map((data) => (
                  <tr key={data._id}>
                    <td>
                      {editableId === data._id ? (
                        <input
                          type="text"
                          className="form-control"
                          value={editedTask}
                          onChange={(e) => setEditedTask(e.target.value)}
                        />
                      ) : (
                        data.task
                      )}
                    </td>
                    <td>
                      {editableId === data._id ? (
                        <select
                          className="form-control"
                          value={editedStatus}
                          onChange={(e) => setEditedStatus(e.target.value)}
                        >
                          <option value="">Status auswählen</option>
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        // Zeige das Label der Statusoption, falls vorhanden
                        statusOptions.find((option) => option.value === data.status)?.label ||
                        data.status
                      )}
                    </td>
                    <td>
                      {editableId === data._id ? (
                        <input
                          type="datetime-local"
                          className="form-control"
                          value={editedDeadline}
                          onChange={(e) => setEditedDeadline(e.target.value)}
                        />
                      ) : (
                        new Date(data.deadline).toLocaleString()
                      )}
                    </td>
                    <td>
                      {editableId === data._id ? (
                        <>
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveEditedTask(data._id)}
                          >
                            Speichern
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => setEditableId(null)}
                          >
                            Abbrechen
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => editTask(data)}
                          >
                            Bearbeiten
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteTask(data._id)}
                          >
                            Löschen
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Rechte Seite - Neue Aufgabe hinzufügen */}
        <div className="col-md-5">
          <h2 className="text-center">Neue Aufgabe</h2>
          <div className="card p-4 bg-light">
            <form onSubmit={addTask}>
              <div className="mb-3">
                <label>Aufgabe</label>
                <input
                  className="form-control"
                  type="text"
                  placeholder="Aufgabe eingeben"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label>Status</label>
                <select
                  className="form-control"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="">Status auswählen</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label>Fällig bis</label>
                <input
                  className="form-control"
                  type="datetime-local"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-success btn-sm">
                Aufgabe hinzufügen
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Todo;
