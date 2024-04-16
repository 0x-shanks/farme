import { Avatar, VStack, Text, SkeletonText } from "@chakra-ui/react";
import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  ShapeProps,
  ShapeUtil,
  T,
  TLBaseShape,
  TLOnClickHandler,
  TLShapeUtilFlag,
} from "tldraw";
import runes from "runes";

export type IUserShape = TLBaseShape<
  "user",
  {
    w: number | undefined;
    h: number | undefined;
    fid: number | undefined;
    pfp: string | undefined;
    displayName: string | undefined;
    bio: string | undefined;
    userName: string | undefined;
    address: string | undefined;
    onClick: () => void;
  }
>;

const cardShapeProps: ShapeProps<IUserShape> = {
  w: T.number.optional(),
  h: T.number.optional(),
  fid: T.positiveInteger.optional(),
  pfp: T.string.optional(),
  displayName: T.string.optional(),
  bio: T.string.optional(),
  userName: T.string.optional(),
  address: T.string.optional(),
  onClick: T.any,
};

export class UserShapeUtil extends ShapeUtil<IUserShape> {
  static override type = "user" as const;
  static override props = cardShapeProps;

  override onClick?: TLOnClickHandler<IUserShape> = (shape) => {
    shape.props.onClick();
  };

  override hideResizeHandles = () => true;
  override hideRotateHandle = () => true;
  override hideSelectionBoundsBg = () => true;
  override hideSelectionBoundsFg = () => true;

  getDefaultProps(): IUserShape["props"] {
    return {
      w: 200,
      h: 200,
      fid: 0,
      pfp: "",
      displayName: "",
      bio: "",
      userName: "",
      address: "",
      onClick: () => {},
    };
  }

  getGeometry(shape: IUserShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w ?? 200,
      height: shape.props.h ?? 200,
      isFilled: true,
    });
  }

  component(shape: IUserShape) {
    return (
      <HTMLContainer>
        <VStack spacing={1} w={shape.props.w} h={shape.props.h}>
          <Avatar
            src={shape.props.pfp ?? ""}
            shadow="xl"
            borderWidth={2}
            borderColor="white"
          />
          {shape.props.userName != undefined ? (
            <VStack spacing={0}>
              <Text
                fontWeight={600}
                w={20}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
                textAlign="center"
              >
                {shape.props.displayName}
              </Text>
              <Text
                textColor="gray"
                fontSize="small"
                w={20}
                textOverflow="ellipsis"
                whiteSpace="nowrap"
                overflow="hidden"
                textAlign="center"
              >{`@${shape.props.userName}`}</Text>
            </VStack>
          ) : (
            <VStack spacing={2}>
              <SkeletonText noOfLines={1} w={20} />
              <SkeletonText noOfLines={1} w={20} />
            </VStack>
          )}
        </VStack>
      </HTMLContainer>
    );
  }

  indicator(shape: IUserShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
