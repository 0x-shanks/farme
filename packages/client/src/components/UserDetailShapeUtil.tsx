import { Avatar, VStack, Text, Card, CardBody, Box } from "@chakra-ui/react";
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

export type IUserDetailShape = TLBaseShape<
  "userDetail",
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

const cardShapeProps: ShapeProps<IUserDetailShape> = {
  w: T.number,
  h: T.number,
  fid: T.positiveInteger,
  pfp: T.string,
  displayName: T.string,
  bio: T.string,
  userName: T.string,
  address: T.string,
};

export class UserDetailShapeUtil extends ShapeUtil<IUserDetailShape> {
  static override type = "userDetail" as const;
  static override props = cardShapeProps;

  getDefaultProps(): IUserDetailShape["props"] {
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

  getGeometry(shape: IUserDetailShape): Geometry2d {
    return new Rectangle2d({
      width: shape.props.w,
      height: shape.props.h,
      isFilled: true,
    });
  }

  component(shape: IUserDetailShape) {
    return (
      <HTMLContainer>
        <VStack spacing={6} w={shape.props.w} h={shape.props.h}>
          <VStack spacing={1} w="full">
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

          <Card shadow="xl">
            <CardBody>
              <Box w={150} h={200} color="red.200" />
            </CardBody>
          </Card>
        </VStack>
      </HTMLContainer>
    );
  }

  indicator(shape: IUserDetailShape) {
    return <rect width={shape.props.w} height={shape.props.h} />;
  }
}
