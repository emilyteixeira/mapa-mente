import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { forwardRef, memo, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Animated, LayoutChangeEvent, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Defs, Path, Pattern, Rect } from "react-native-svg";

import { useColors } from "@/hooks/use-colors";
import type { MindEdge, MindMap, MindNode } from "@/types/mind-map";

const CANVAS_WIDTH = 1400;
const CANVAS_HEIGHT = 900;
const NODE_WIDTH = 154;
const NODE_HEIGHT = 58;
const MIN_SCALE = 0.45;
const MAX_SCALE = 1.8;

interface Camera {
  x: number;
  y: number;
  scale: number;
}

export interface MindMapCanvasHandle {
  zoomIn: () => void;
  zoomOut: () => void;
  fit: () => void;
}

interface MindMapCanvasProps {
  map: MindMap;
  selectedNodeId: string | null;
  showGrid: boolean;
  onSelectNode: (nodeId: string | null) => void;
  onMoveNode: (nodeId: string, x: number, y: number) => void;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function edgePath(edge: MindEdge, nodes: Map<string, MindNode>): string {
  const source = nodes.get(edge.sourceId);
  const target = nodes.get(edge.targetId);
  if (!source || !target) return "";
  const x1 = source.x + NODE_WIDTH / 2;
  const y1 = source.y + NODE_HEIGHT / 2;
  const x2 = target.x + NODE_WIDTH / 2;
  const y2 = target.y + NODE_HEIGHT / 2;
  if (edge.style === "straight") return `M ${x1} ${y1} L ${x2} ${y2}`;
  const distance = Math.abs(x2 - x1);
  const bend = Math.max(70, distance * 0.42);
  const direction = x2 >= x1 ? 1 : -1;
  return `M ${x1} ${y1} C ${x1 + bend * direction} ${y1}, ${x2 - bend * direction} ${y2}, ${x2} ${y2}`;
}

export const MindMapCanvas = forwardRef<MindMapCanvasHandle, MindMapCanvasProps>(function MindMapCanvas(
  { map, selectedNodeId, showGrid, onSelectNode, onMoveNode },
  ref,
) {
  const colors = useColors();
  const [viewport, setViewport] = useState({ width: 1, height: 1 });
  const [camera, setCamera] = useState<Camera>({ x: -410, y: -245, scale: 0.85 });
  const panStart = useRef(camera);
  const pinchStart = useRef(camera.scale);
  const nodesById = useMemo(() => new Map(map.nodes.map((node) => [node.id, node])), [map.nodes]);

  const fit = () => {
    if (!map.nodes.length || viewport.width <= 1) return;
    const minX = Math.min(...map.nodes.map((node) => node.x));
    const maxX = Math.max(...map.nodes.map((node) => node.x + NODE_WIDTH));
    const minY = Math.min(...map.nodes.map((node) => node.y));
    const maxY = Math.max(...map.nodes.map((node) => node.y + NODE_HEIGHT));
    const contentWidth = maxX - minX + 120;
    const contentHeight = maxY - minY + 160;
    const scale = clamp(Math.min(viewport.width / contentWidth, viewport.height / contentHeight), MIN_SCALE, 1.15);
    setCamera({
      scale,
      x: viewport.width / 2 - (minX + (maxX - minX) / 2) * scale,
      y: viewport.height / 2 - (minY + (maxY - minY) / 2) * scale,
    });
  };

  useImperativeHandle(ref, () => ({
    zoomIn: () => setCamera((value) => ({ ...value, scale: clamp(value.scale + 0.15, MIN_SCALE, MAX_SCALE) })),
    zoomOut: () => setCamera((value) => ({ ...value, scale: clamp(value.scale - 0.15, MIN_SCALE, MAX_SCALE) })),
    fit,
  }));

  useEffect(() => {
    const timer = setTimeout(fit, 80);
    return () => clearTimeout(timer);
    // O enquadramento inicial deve ocorrer quando o mapa muda, não durante cada movimento.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map.id, viewport.width, viewport.height]);

  const panGesture = useMemo(() => Gesture.Pan()
    .minDistance(3)
    .onStart(() => { panStart.current = camera; })
    .onUpdate((event) => setCamera((value) => ({ ...value, x: panStart.current.x + event.translationX, y: panStart.current.y + event.translationY })))
    .runOnJS(true), [camera]);

  const pinchGesture = useMemo(() => Gesture.Pinch()
    .onStart(() => { pinchStart.current = camera.scale; })
    .onUpdate((event) => setCamera((value) => ({ ...value, scale: clamp(pinchStart.current * event.scale, MIN_SCALE, MAX_SCALE) })))
    .runOnJS(true), [camera.scale]);

  const backgroundTap = useMemo(() => Gesture.Tap().onEnd(() => onSelectNode(null)).runOnJS(true), [onSelectNode]);
  const canvasGesture = useMemo(() => Gesture.Simultaneous(panGesture, pinchGesture, backgroundTap), [backgroundTap, panGesture, pinchGesture]);
  const translateX = camera.x + (CANVAS_WIDTH * (camera.scale - 1)) / 2;
  const translateY = camera.y + (CANVAS_HEIGHT * (camera.scale - 1)) / 2;

  const handleLayout = (event: LayoutChangeEvent) => setViewport(event.nativeEvent.layout);

  return (
    <View style={[styles.viewport, { backgroundColor: colors.background }]} onLayout={handleLayout}>
      <GestureDetector gesture={canvasGesture}>
        <Animated.View style={StyleSheet.absoluteFill}>
          <Animated.View
            style={[
              styles.canvas,
              {
                backgroundColor: colors.background,
                transform: [{ translateX }, { translateY }, { scale: camera.scale }],
              },
            ]}
          >
            <Svg width={CANVAS_WIDTH} height={CANVAS_HEIGHT} style={[StyleSheet.absoluteFill, styles.noPointerEvents]}>
              {showGrid ? (
                <>
                  <Defs>
                    <Pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
                      <Path d="M 24 0 L 0 0 0 24" fill="none" stroke={colors.border} strokeWidth="0.8" opacity="0.55" />
                    </Pattern>
                  </Defs>
                  <Rect width="100%" height="100%" fill="url(#grid)" />
                </>
              ) : null}
              {map.edges.map((edge) => (
                <Path
                  key={edge.id}
                  d={edgePath(edge, nodesById)}
                  fill="none"
                  stroke={edge.color}
                  strokeWidth={selectedNodeId === edge.sourceId || selectedNodeId === edge.targetId ? 4 : 3}
                  strokeLinecap="round"
                  opacity={selectedNodeId && selectedNodeId !== edge.sourceId && selectedNodeId !== edge.targetId ? 0.32 : 0.78}
                />
              ))}
            </Svg>
            {map.nodes.map((node) => (
              <MapNodeView
                key={node.id}
                node={node}
                selected={node.id === selectedNodeId}
                scale={camera.scale}
                onSelect={onSelectNode}
                onMove={onMoveNode}
              />
            ))}
          </Animated.View>
        </Animated.View>
      </GestureDetector>
      <MiniMap map={map} camera={camera} viewport={viewport} />
      <View style={[styles.scaleBadge, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Text style={[styles.scaleText, { color: colors.muted }]}>{Math.round(camera.scale * 100)}%</Text>
      </View>
    </View>
  );
});

const MapNodeView = memo(function MapNodeView({
  node,
  selected,
  scale,
  onSelect,
  onMove,
}: {
  node: MindNode;
  selected: boolean;
  scale: number;
  onSelect: (nodeId: string) => void;
  onMove: (nodeId: string, x: number, y: number) => void;
}) {
  const [position, setPosition] = useState({ x: node.x, y: node.y });
  const start = useRef(position);
  useEffect(() => setPosition({ x: node.x, y: node.y }), [node.x, node.y]);

  const drag = useMemo(() => Gesture.Pan()
    .minDistance(2)
    .onStart(() => { start.current = position; onSelect(node.id); })
    .onUpdate((event) => setPosition({ x: start.current.x + event.translationX / scale, y: start.current.y + event.translationY / scale }))
    .onEnd(() => onMove(node.id, position.x, position.y))
    .runOnJS(true), [node.id, onMove, onSelect, position, scale]);

  return (
    <GestureDetector gesture={drag}>
      <Pressable
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${node.parentId ? "Tópico" : "Ideia central"}: ${node.text}`}
        accessibilityHint="Toque para selecionar; arraste para mover"
        onPress={() => onSelect(node.id)}
        style={[
          styles.node,
          {
            left: position.x,
            top: position.y,
            backgroundColor: node.color,
            borderRadius: node.shape === "pill" ? 28 : node.shape === "rectangle" ? 9 : 16,
            borderColor: selected ? "#FFFFFF" : `${node.color}CC`,
            borderWidth: selected ? 3 : 1,
            shadowOpacity: selected ? 0.26 : 0.13,
          },
        ]}
      >
        <Text numberOfLines={2} style={styles.nodeText}>{node.text}</Text>
        {node.note ? <View style={styles.noteDot} /> : null}
      </Pressable>
    </GestureDetector>
  );
});

function MiniMap({ map, camera, viewport }: { map: MindMap; camera: Camera; viewport: { width: number; height: number } }) {
  const colors = useColors();
  const width = 116;
  const height = 74;
  const viewX = clamp((-camera.x / camera.scale / CANVAS_WIDTH) * width, 0, width);
  const viewY = clamp((-camera.y / camera.scale / CANVAS_HEIGHT) * height, 0, height);
  const viewWidth = clamp((viewport.width / camera.scale / CANVAS_WIDTH) * width, 10, width);
  const viewHeight = clamp((viewport.height / camera.scale / CANVAS_HEIGHT) * height, 8, height);
  return (
    <View style={[styles.miniMap, styles.noPointerEvents, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Svg width={width} height={height}>
        {map.nodes.map((node) => <Rect key={node.id} x={(node.x / CANVAS_WIDTH) * width} y={(node.y / CANVAS_HEIGHT) * height} width="11" height="5" rx="2" fill={node.color} />)}
        <Rect x={viewX} y={viewY} width={viewWidth} height={viewHeight} rx="3" fill="none" stroke={colors.foreground} strokeWidth="1.2" opacity="0.75" />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, overflow: "hidden" },
  canvas: { position: "absolute", width: CANVAS_WIDTH, height: CANVAS_HEIGHT },
  node: {
    position: "absolute",
    width: NODE_WIDTH,
    minHeight: NODE_HEIGHT,
    paddingHorizontal: 13,
    paddingVertical: 10,
    justifyContent: "center",
    shadowColor: "#151620",
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 11,
    elevation: 5,
  },
  nodeText: { color: "#FFFFFF", fontSize: 14, lineHeight: 18, fontWeight: "800", textAlign: "center" },
  noteDot: { position: "absolute", width: 7, height: 7, borderRadius: 4, right: 7, top: 7, backgroundColor: "#FFFFFF" },
  miniMap: { position: "absolute", right: 14, top: 14, width: 118, height: 76, borderRadius: 11, borderWidth: 1, overflow: "hidden", opacity: 0.9 },
  scaleBadge: { position: "absolute", left: 14, top: 14, minWidth: 54, height: 30, borderRadius: 10, borderWidth: 1, alignItems: "center", justifyContent: "center" },
  scaleText: { fontSize: 11, fontWeight: "800" },
  noPointerEvents: { pointerEvents: "none" },
});
