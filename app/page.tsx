'use client';

import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { v4 as uuidv4 } from 'uuid';

type Todo = {
  uid: string; // ← ドラッグ識別用の固定ID
  todo: string;
  status: '未着手' | '進行中' | '完了';
  priority: '高' | '中' | '低';
  deadline: Dayjs | null;
};

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const addTodo = () => {
    setTodos((prev) => [
      ...prev,
      {
        uid: uuidv4(),
        todo: '',
        status: '未着手',
        priority: '中',
        deadline: null,
      },
    ]);
  };

  // K は Todo のキー型
  const handleChange = <K extends keyof Todo>(
    uid: string,
    field: K,
    value: Todo[K]
  ) => {
    setTodos((prev) =>
      prev.map((t) => (t.uid === uid ? { ...t, [field]: value } : t))
    );
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTodos((items) => {
      const oldIndex = items.findIndex((t) => t.uid === active.id);
      const newIndex = items.findIndex((t) => t.uid === over.id);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  return (
    <Container
      maxWidth={false} // 最大幅制限なし
      disableGutters // 横の余白をなくす
      sx={{ width: '100vw', maxWidth: '100vw' }} // 幅を画面いっぱいに
    >
      <Box sx={{ bgcolor: 'primary.main', p: 2 }}>
        <Typography variant="h4" color="primary.contrastText" align="left">
          todo
        </Typography>
      </Box>

      <Box mt={2}>
        <Box
          display="grid"
          gridTemplateColumns="40px 40px 1fr 150px 120px 180px"
          gap={1}
          mb={1}
        >
          <Typography fontWeight="bold"></Typography>
          <Typography fontWeight="bold">ID</Typography>
          <Typography fontWeight="bold">Todo</Typography>
          <Typography fontWeight="bold">進行度</Typography>
          <Typography fontWeight="bold">優先度</Typography>
          <Typography fontWeight="bold">締め切り</Typography>
        </Box>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={todos.map((t) => t.uid)}
            strategy={verticalListSortingStrategy}
          >
            {todos.map((todo, index) => (
              <SortableRow
                key={todo.uid}
                todo={todo}
                displayId={index + 1} // 表示用の連番
                handleChange={handleChange}
              />
            ))}
          </SortableContext>
        </DndContext>
      </Box>

      <Box mt={2}>
        <Button variant="contained" onClick={addTodo}>
          新規作成
        </Button>
      </Box>
    </Container>
  );
}

function SortableRow({
  todo,
  displayId,
  handleChange,
}: {
  todo: Todo;
  displayId: number;
  handleChange: <K extends keyof Todo>(
    uid: string,
    field: K,
    value: Todo[K]
  ) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: todo.uid });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    display: 'grid',
    gridTemplateColumns: '40px 40px 1fr 150px 120px 180px',
    gap: '8px',
    alignItems: 'center',
    padding: '8px',
    background: '#f9f9f9',
    marginBottom: '4px',
    borderRadius: '4px',
  };

  const statusColors = {
    未着手: 'rgba(128,128,128,0.6)', // グレー60%透明
    進行中: 'rgba(0,0,255,0.6)', // 青60%透明
    完了: 'rgba(0,128,0,0.6)', // 緑60%透明
  };

  const priorityColors = {
    高: 'rgba(255,0,0,0.6)', // 赤60%透明
    中: 'rgba(255,165,0,0.6)', // オレンジ60%透明
    低: 'rgba(135,206,235,0.6)', // スカイブルー60%透明
  };

  return (
    <Box ref={setNodeRef} style={style}>
      {/* ドラッグハンドル */}
      <Box
        {...attributes}
        {...listeners}
        sx={{ cursor: 'grab', display: 'flex', justifyContent: 'center' }}
      >
        <DragIndicatorIcon />
      </Box>

      {/* 表示用の連番 */}
      <Typography>{displayId}</Typography>

      {/* Todo */}
      <TextField
        size="small"
        value={todo.todo}
        onChange={(e) => handleChange(todo.uid, 'todo', e.target.value)}
      />

      {/* Status */}
      <TextField
        select
        size="small"
        value={todo.status}
        onChange={(e) =>
          handleChange(todo.uid, 'status', e.target.value as Todo['status'])
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FiberManualRecordIcon
                  sx={{ color: statusColors[todo.status], mr: 1 }}
                />
              </InputAdornment>
            ),
          },
        }}
      >
        {['未着手', '進行中', '完了'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {/* Priority */}
      <TextField
        select
        size="small"
        value={todo.priority}
        onChange={(e) =>
          handleChange(todo.uid, 'priority', e.target.value as Todo['priority'])
        }
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <FiberManualRecordIcon
                  sx={{ color: priorityColors[todo.priority], mr: 1 }}
                />
              </InputAdornment>
            ),
          },
        }}
      >
        {['高', '中', '低'].map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </TextField>

      {/* 締め切り */}
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          value={todo.deadline}
          onChange={(newValue) => handleChange(todo.uid, 'deadline', newValue)}
          disablePast
          format="YYYY/MM/DD"
          slotProps={{ textField: { size: 'small' } }}
        />
      </LocalizationProvider>
    </Box>
  );
}
