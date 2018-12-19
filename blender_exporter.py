from itertools import chain
import json

def flatten(l):
    """
    flatten([[1,2],[3],[4,5]]) == [1,2,3,4,5]
    """
    return chain(*l)
    
def iterate_pairwise(l):
    """
    iter = iterate_pairwise([ 
        1, 2, 3, 4, 5
    ]) 
    list(iter) == [
        (1, 2), (2, 3), (3, 4), (4, 5)
    ]

    returns an empty list for one element input
    """
    return zip(l[::], l[1::])

def export_vertex(vert, vertex_groups):
  """
  { 
    x: 0, 
    y: 1, 
    z: 0, 
    weights: [
      { bone: "Root", weight: 1 }
    ], 
    name: "p0" 
  }
  """
  return dict(
      name=str(vert.index),
      x=vert.co.x,
      y=vert.co.y,
      z=vert.co.z,
      weights=[
          dict(bone=vertex_groups[_.group].name, weight=_.weight)
          for _ in vert.groups
      ]
  )

def export_vertices():
  source = bpy.data.objects['Cube'].data.vertices
  vertex_groups = bpy.data.objects['Cube'].vertex_groups
  return [export_vertex(_, vertex_groups=vertex_groups) for _ in source]
  
def export_face(face, vertices):
    indices = face.vertices
    p0 = vertices[indices[0]]
    p1 = vertices[indices[1]]
    p2 = vertices[indices[2]]
    if len(indices) == 4:
        # triangulate
        p3 = vertices[indices[3]]
        return [p0, p1, p2, p2, p3, p0]
    else:
        return [p0, p1, p2]
    
  
def export_faces(vertices):
    polys = bpy.data.objects['Cube'].data.polygons
    return flatten(export_face(face, vertices) for face in polys)

def export_bindpose_bone(bone):
    """
    {
        rotation: [0, 0, 0],
        translation: [0, 0, 0],
        name: "Root"
    }
    """
    return dict(
        name=bone.name,
        rotation=list(bone.rotation_euler[:3]),
        translation=list(bone.head.xyz),
        parent=bone.parent.name if bone.parent else None
    )

def export_bindpose_bones():
    source = bpy.data.objects['Armature'].pose.bones
    return [export_bindpose_bone(_) for _ in source]

def export_pose_bone(bone):
    """
    {
        rotation: [0, 0, 0],
        translation: [0, 0, 0],
        name: "Root"
    }
    """
    return dict(
        name=bone.name,
        rotation=list(bone.rotation_euler[:3]),
        translation=list(bone.head.xyz),
        parent=bone.parent.name if bone.parent else None
    )

def export_pose_bones():
    source = bpy.data.objects['Armature'].pose.bones
    return [export_pose_bone(_) for _ in source]

def export_action(action):
    """
    The main action here is to take the keyframes and pair them, so if you have
        keyframe 1, keyframe 2, keyframe 3,
    then it'll make segments for each pair (1 to 2, 2 to 3)
    """
    return dict(
        name=action.name,
        secondsPerFrame=1,
        framecount=action.frame_range[1]-action.frame_range[0],
        channelsByBoneName={
            fcu.group.name: [
                dict(
                    fromValue=frame_a.co[1],
                    toValue=frame_b.co[1],
                    startFrame=frame_a.co[0],
                    stopFrame=frame_b.co[0],
                    property=fcu.data_path.split('.')[-1],
                    component=fcu.array_index,
                ) for frame_a, frame_b 
                in iterate_pairwise(fcu.keyframe_points)
            ] for fcu in action.fcurves
            
        }
    )

def export_actions():
    return [export_action(_) for _ in bpy.data.actions]
            
def copy_vertices():
    bpy.context.window_manager.clipboard = json.dumps(list(export_faces(export_vertices(), indent=1)))
    
def copy_bones():
    bpy.context.window_manager.clipboard = json.dumps(export_bindpose_bones(), indent=1)
    
def copy_actions():
    bpy.context.window_manager.clipboard = json.dumps(export_actions(), indent=1)
    
    

