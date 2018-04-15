%%
syms Xw Yw Zw f cx cy pixx pixy s roll pitch yaw Xc Yc Zc

% camera IO
K = [f 0 cx;0 f cy;0 0 1];

% camera EO
Rx = [1 0 0; 0 cos(roll) sin(roll); 0 -sin(roll) cos(roll)];
Ry = [cos(pitch) 0 -sin(pitch); 0 1 0;sin(pitch) 0 cos(pitch)];
Rz = [cos(yaw) sin(yaw) 0; -sin(yaw) cos(yaw) 0; 0 0 1];
R = Rx*Ry*Rz;

P = R * [eye(3) [-Xc;-Yc;-Zc]];

% world coords
xyz = [Xw;Yw;Zw;1];
eqn = s.*[pixx;pixy;1]==K*P*xyz;

EQ(1) = eqn(1)./eqn(3);
EQ(2) = eqn(2)./eqn(3);
EQ(3) = Zw==0;

% Solve for Xw and Yw
sol = solve(EQ,[Xw,Yw,Zw]);

strXeqn = sprintf('Xw = %s',sol.Xw);
strYeqn = sprintf('Yw = %s',sol.Yw);

oldstr = {'sin','cos','f','cx','cy','Xc','Yc','Zc','roll','pitch','yaw'}; 
newstr = {'Math.sin',...
             'Math.cos',...
             'this.IO.f',...
             'this.IO.cx',...
             'this.IO.cy',...
             'this.EO.Xc',...
             'this.EO.Yc',...
             'this.EO.Zc',...
             'this.EO.roll',...
             'this.EO.pitch',...
             'this.EO.yaw'};
for i=1:numel(oldstr)
    strXeqn = strrep(strXeqn,oldstr{i},newstr{i});
    strYeqn = strrep(strYeqn,oldstr{i},newstr{i});
end
strXeqn = linewrap([strXeqn ';'],100);
strYeqn = linewrap([strYeqn ';'],100);
clc
for i=1:numel(strXeqn)
    fprintf('%s\n',strXeqn{i});
end
fprintf('\n');
for i=1:numel(strYeqn)
    fprintf('%s\n',strYeqn{i});
end
% fprintf('Xw = %s\n',