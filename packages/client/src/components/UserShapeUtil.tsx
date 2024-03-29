import { Avatar, VStack, Text } from "@chakra-ui/react";
import {
  Geometry2d,
  HTMLContainer,
  Rectangle2d,
  ShapeProps,
  ShapeUtil,
  T,
  TLBaseShape,
} from "tldraw";
import runes from "runes";

export type IUserShape = TLBaseShape<
  "user",
  {
    w: number;
    h: number;
    fid: number;
    pfp: string;
    displayName: string;
    bio: string;
    userName: string;
    address: string;
  }
>;

const cardShapeProps: ShapeProps<IUserShape> = {
  w: T.number,
  h: T.number,
  fid: T.positiveInteger,
  pfp: T.string,
  displayName: T.string,
  bio: T.string,
  userName: T.string,
  address: T.string,
};

export class UserShapeUtil extends ShapeUtil<IUserShape> {
  static override type = "user" as const;
  static override props = cardShapeProps;

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
    };
  }

  getGeometry(shape: IUserShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: false,
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
          <VStack spacing={0}>
            <Text fontWeight={600}>
              {`${!!shape.props.displayName ? runes.substr(shape.props.displayName, 0, 8) : ""}${!!shape.props.displayName?.length && shape.props.displayName?.length > 8 ? "..." : ""}`}
            </Text>
            <Text
              textColor="gray"
              fontSize="small"
            >{`@${shape.props.userName}`}</Text>
          </VStack>
        </VStack>
      </HTMLContainer>
    );
  }

  indicator(shape: IUserShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
