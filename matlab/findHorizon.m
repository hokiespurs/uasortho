function findHorizon(f,totpixx,totpixy,roll,pitch,yaw,horizonangle)
totpixx = 4000;
totpixy = 3000;
cx = totpixx/2;
cy = totpixy/2;
f = 4000;

yaw = 0;
pitch = 50;
roll = 30;

yaw = yaw*pi/180;
pitch = pitch*pi/180;
roll = roll*pi/180;

horizonangle = 85;

Xc = 0;
Yc = 0;
Zc = 200;

vfov = 2 * atan2d(totpixy/2,f);
hfov = 2 * atan2d(totpixx/2,f);

%
cornerpix = [1 1;totpixx 1;totpixx totpixy;1 totpixy; 1 1; cx cy];
% cornerpix = [ones(size((1:totpixy)')) (1:totpixy)'];
%
K = [f 0 cx;0 f cy;0 0 1];

% R2TaitBryan = [0 1 0;1 0 0;0 0 -1];
% Rx = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
% Ry = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
% Rz = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
% R = Rx*Ry*Rz*R2TaitBryan;
R_WORLD_2_AIR = [0 1 0;1 0 0;0 0 -1];
R_AIR_2_CAMERA = [0 1 0;-1 0 0;0 0 1];
R_AIR_ROLL = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
R_AIR_PITCH = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
R_AIR_YAW = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
R = R_AIR_2_CAMERA * R_AIR_ROLL * R_AIR_PITCH * R_AIR_YAW * R_WORLD_2_AIR;

P = K * R * [eye(3) [-Xc;-Yc;-Zc]];

R2 = R_AIR_2_CAMERA * R_AIR_ROLL * R_AIR_PITCH * R_AIR_YAW * R_WORLD_2_AIR;

inv(R_AIR_ROLL)*inv(R_AIR_2_CAMERA);
P(4,:)=[0 0 0 1];

iP = inv(P);
f2 = figure(2);clf
allazel=[]
for i=1:size(cornerpix,1)
%     xyz = iP*[cornerpix(i,1);cornerpix(i,2);1;1]-[Xc;Yc;Zc;1];
    xyz = inv(R2)*inv(K)*[cornerpix(i,1);cornerpix(i,2);1];
    plot3([0 xyz(1)],[0 xyz(2)],[0 xyz(3)],'b.-');hold on;axis equal
%     [az,el,~]=cart2sph(xyz(1),xyz(2),xyz(3));grid on
    r = pythag(xyz(1),xyz(2));
%     az = atan2d(xyz(3),xyz(2));
     el = 90 + atan2d(xyz(3),r);
   allazel(i,:)=[1 el];
   allxyz(i,:) = xyz;
end
fill3(allxyz(1:4,1),allxyz(1:4,2),allxyz(1:4,3),'b','FaceAlpha',0.5);
xlabel('x');
ylabel('y');
zlabel('z');
f1 = figure(1);
clf;
plot(1:size(cornerpix,1),allazel(:,2),'b.-')
hold on
plot([1 5],[90 90],'k--');
plot([1 5],[pitch pitch]*180/pi,'g--')
plot([1 5],vfov/2 + [pitch pitch]*180/pi,'c--')
plot([1 5],-vfov/2 + [pitch pitch]*180/pi,'c--')

% axis equal



%% Compute FOV Constants
ifov = atan2d(1,f);
vfov = ifov*totpixy;
hfov = ifov*totpixx;

%% Computer corners
pix_of_corners = [totpixx, totpixy;
                  totpixx, 1;
                  1, 1;
                  1, totpixy];

az_center = yaw;
el_center = pitch;
cornerazel = [ hfov/2  vfov/2;
               hfov/2 -vfov/2;
              -hfov/2 -vfov/2;
              -hfov/2  vfov/2];

R = [cosd(roll) -sind(roll); sind(roll) cosd(roll)];
rotazel = cornerazel * R;
azel_of_corners = [az_center el_center] + rotazel;

%% Make 8x5 matrix for each corner and possible itnersection
% [isused,az,al,x,y]
% (1,3,5,7) are corners, others are in between segments
CornerPixRaw = nan(8,5);

% fill in corners
CornerPixRaw(1:2:end,:) = [ones(4,1) azel_of_corners pix_of_corners];
CornerPix = CornerPixRaw;
for i=1:2:8
    i1 = i;
    i2 = i+2;
    if i2>8
       i2 = 1; 
    end
    az1 = CornerPixRaw(i1,2);
    el1 = CornerPixRaw(i1,3);
    az2 = CornerPixRaw(i2,2);
    el2 = CornerPixRaw(i2,3);
   
    T = (horizonangle-el1)/(el2-el1);
    
    if T>0 && T<1
        if el1>el2
            CornerPix(i1,:)=nan;
        else
            CornerPix(i2,:)=nan;
        end
        x1 = CornerPixRaw(i1,4);
        y1 = CornerPixRaw(i1,5);
        x2 = CornerPixRaw(i2,4);
        y2 = CornerPixRaw(i2,5);
        
        seg_xpix = x1+(x2-x1)*T;
        seg_ypix = y1+(y2-y1)*T;
        seg_az = az1+(az2-az1)*T;
        seg_el = el1+(el2-el1)*T;
        CornerPix(i1+1,:) = [1 seg_az seg_el seg_xpix seg_ypix];
    end
end
badinds = isnan(CornerPix(:,1)) | CornerPix(:,3)>horizonangle;
CornerPix(badinds,:)=[];

badinds = isnan(CornerPixRaw(:,1));
CornerPixRaw(badinds,:)=[];

%% Plot 
figure(10);clf
plot([CornerPixRaw(:,2); CornerPixRaw(1,2)],[CornerPixRaw(:,3); CornerPixRaw(1,3)],'r-');
hold on
plot([-180 540],[0 0],'k-');
plot([-180 540],[horizonangle horizonangle],'k--');
plot([0 0],[-180 180],'b');
plot([360 360],[-180 180],'b');
plot(az_center,el_center,'r*');
fill([CornerPix(:,2); CornerPix(1,2)],[CornerPix(:,3); CornerPix(1,3)],'g');

xticks(-90:20:450)
yticks(-90:10:180)
axis tight
axis equal
axis([-90 360+90 -90 180]);

grid on
xlabel('Azimuth');
ylabel('Elevation');
end