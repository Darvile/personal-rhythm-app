import { useMemo } from 'react';
import { Stage, Layer, Path, Text, Group, Circle } from 'react-konva';
import type { Stage as StageType, Component } from '../types';

// @ts-ignore - headbreaker doesn't have TypeScript types
import * as headbreaker from 'headbreaker';

interface PuzzleCanvasProps {
  component: Component;
  stages: StageType[];
}

interface PuzzlePieceData {
  stage: StageType;
  pathData: string;
  x: number;
  y: number;
  width: number;
  height: number;
  index: number;
}

// Use Headbreaker's manufacturers to generate puzzle structure
function generatePuzzleWithHeadbreaker(rows: number, cols: number, pieceSize: number) {
  // Create manufacturers for puzzle pieces
  const manufacturer = new headbreaker.manufacturers.Manufacturer();

  // Generate a simple grid structure
  const pieces: any[] = [];

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const piece = manufacturer.withStructure(
        manufacturer.newPiece({
          centralAnchor: {
            x: col * pieceSize + pieceSize / 2,
            y: row * pieceSize + pieceSize / 2
          }
        })
      );

      // Set up connections (tabs/blanks) based on neighbors
      if (row > 0) piece.placeAt('up');
      if (col < cols - 1) piece.placeAt('right');
      if (row < rows - 1) piece.placeAt('down');
      if (col > 0) piece.placeAt('left');

      pieces.push(piece);
    }
  }

  return pieces;
}

// Convert Headbreaker piece structure to SVG path
function headbreakerPieceToPath(structure: any, size: number): string {
  const tabSize = size * 0.15;

  let path = 'M 0,0';

  // Top edge
  if (structure && structure.up) {
    const isTab = structure.up === headbreaker.Tab;
    const mid = size / 2;
    if (isTab) {
      path += ` L ${mid - 20},0 C ${mid - 10},${-tabSize} ${mid},${-tabSize} ${mid},${-tabSize}`;
      path += ` C ${mid},${-tabSize} ${mid + 10},${-tabSize} ${mid + 20},0`;
    } else {
      path += ` L ${mid - 20},0 C ${mid - 10},${tabSize} ${mid},${tabSize} ${mid},${tabSize}`;
      path += ` C ${mid},${tabSize} ${mid + 10},${tabSize} ${mid + 20},0`;
    }
  }
  path += ` L ${size},0`;

  // Right edge
  if (structure && structure.right) {
    const isTab = structure.right === headbreaker.Tab;
    const mid = size / 2;
    if (isTab) {
      path += ` L ${size},${mid - 20} C ${size + tabSize},${mid - 10} ${size + tabSize},${mid} ${size + tabSize},${mid}`;
      path += ` C ${size + tabSize},${mid} ${size + tabSize},${mid + 10} ${size},${mid + 20}`;
    } else {
      path += ` L ${size},${mid - 20} C ${size - tabSize},${mid - 10} ${size - tabSize},${mid} ${size - tabSize},${mid}`;
      path += ` C ${size - tabSize},${mid} ${size - tabSize},${mid + 10} ${size},${mid + 20}`;
    }
  }
  path += ` L ${size},${size}`;

  // Bottom edge
  if (structure && structure.down) {
    const isTab = structure.down === headbreaker.Tab;
    const mid = size / 2;
    if (isTab) {
      path += ` L ${mid + 20},${size} C ${mid + 10},${size + tabSize} ${mid},${size + tabSize} ${mid},${size + tabSize}`;
      path += ` C ${mid},${size + tabSize} ${mid - 10},${size + tabSize} ${mid - 20},${size}`;
    } else {
      path += ` L ${mid + 20},${size} C ${mid + 10},${size - tabSize} ${mid},${size - tabSize} ${mid},${size - tabSize}`;
      path += ` C ${mid},${size - tabSize} ${mid - 10},${size - tabSize} ${mid - 20},${size}`;
    }
  }
  path += ` L 0,${size}`;

  // Left edge
  if (structure && structure.left) {
    const isTab = structure.left === headbreaker.Tab;
    const mid = size / 2;
    if (isTab) {
      path += ` L 0,${mid + 20} C ${-tabSize},${mid + 10} ${-tabSize},${mid} ${-tabSize},${mid}`;
      path += ` C ${-tabSize},${mid} ${-tabSize},${mid - 10} 0,${mid - 20}`;
    } else {
      path += ` L 0,${mid + 20} C ${tabSize},${mid + 10} ${tabSize},${mid} ${tabSize},${mid}`;
      path += ` C ${tabSize},${mid} ${tabSize},${mid - 10} 0,${mid - 20}`;
    }
  }
  path += ` L 0,0 Z`;

  return path;
}

export function PuzzleCanvas({ component, stages }: PuzzleCanvasProps) {
  const pieces = useMemo(() => {
    if (stages.length === 0) return [];

    const count = stages.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const pieceSize = 100;

    try {
      // Use Headbreaker to generate puzzle structure
      const headbreakerPieces = generatePuzzleWithHeadbreaker(rows, cols, pieceSize);

      // Convert to our format
      const puzzlePieces: PuzzlePieceData[] = stages.map((stage, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;

        const hbPiece = headbreakerPieces[index];
        const structure = hbPiece?.structure;

        const pathData = headbreakerPieceToPath(structure, pieceSize);

        return {
          stage,
          pathData,
          x: col * pieceSize,
          y: row * pieceSize,
          width: pieceSize,
          height: pieceSize,
          index: index + 1,
        };
      });

      return puzzlePieces;
    } catch (error) {
      console.error('Error generating puzzle with Headbreaker:', error);
      // Fallback to simple rectangles
      return stages.map((stage, index) => {
        const row = Math.floor(index / cols);
        const col = index % cols;
        return {
          stage,
          pathData: `M 0,0 L ${pieceSize},0 L ${pieceSize},${pieceSize} L 0,${pieceSize} Z`,
          x: col * pieceSize,
          y: row * pieceSize,
          width: pieceSize,
          height: pieceSize,
          index: index + 1,
        };
      });
    }
  }, [stages]);

  const canvasSize = useMemo(() => {
    if (stages.length === 0) return { width: 800, height: 600 };

    const cols = Math.ceil(Math.sqrt(stages.length));
    const rows = Math.ceil(stages.length / cols);
    const pieceSize = 100;

    return {
      width: cols * pieceSize,
      height: rows * pieceSize,
    };
  }, [stages]);

  if (stages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No stages yet. Add stages to see your progress puzzle!
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center py-6">
      <Stage width={canvasSize.width} height={canvasSize.height}>
        <Layer>
          {pieces.map((piece) => {
            const isCompleted = piece.stage.status === 'completed';
            const fillColor = isCompleted ? (piece.stage.color || component.color) : '#f3f4f6';
            const textColor = isCompleted ? '#ffffff' : '#6b7280';

            return (
              <Group key={piece.stage._id} x={piece.x} y={piece.y}>
                <Path
                  data={piece.pathData}
                  fill={fillColor}
                  stroke={isCompleted ? '#1f2937' : '#9ca3af'}
                  strokeWidth={2}
                  opacity={isCompleted ? 1 : 0.5}
                />

                <Text
                  x={piece.width / 2}
                  y={piece.height / 2 - 20}
                  text={piece.index.toString()}
                  fontSize={16}
                  fontStyle="bold"
                  fill={textColor}
                  align="center"
                  width={piece.width}
                  offsetX={piece.width / 2}
                />

                <Text
                  x={piece.width / 2}
                  y={piece.height / 2}
                  text={piece.stage.name.length > 10
                    ? piece.stage.name.substring(0, 10) + '...'
                    : piece.stage.name}
                  fontSize={12}
                  fill={textColor}
                  align="center"
                  width={piece.width}
                  offsetX={piece.width / 2}
                />

                {isCompleted && (
                  <Group x={piece.width - 25} y={5}>
                    <Circle x={10} y={10} radius={10} fill="#10b981" />
                    <Path
                      data="M 6 10 L 9 13 L 14 7"
                      stroke="#ffffff"
                      strokeWidth={2}
                      lineCap="round"
                      lineJoin="round"
                    />
                  </Group>
                )}
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
}
